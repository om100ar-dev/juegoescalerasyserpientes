import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { computeMove } from '../constants/board';
import type { Room, Player, GameState, DiceValue } from '../types/game';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseGameEngineOptions {
    roomCode: string;
    playerId: string;
}

interface UseGameEngineReturn extends GameState {
    rollDice: () => Promise<void>;
    diceValue: number;
    isRolling: boolean;
    lastMoveInfo: {
        hitSnake: boolean;
        hitLadder: boolean;
        intermediatePosition: number;
    } | null;
}

const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds as fallback

export function useGameEngine({ roomCode, playerId }: UseGameEngineOptions): UseGameEngineReturn {
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [lastMoveInfo, setLastMoveInfo] = useState<{
        hitSnake: boolean;
        hitLadder: boolean;
        intermediatePosition: number;
    } | null>(null);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const realtimeWorkingRef = useRef(false);

    // Derive player info from room state
    const myPlayer = room?.players.find((p) => p.id === playerId) ?? null;
    const opponent = room?.players.find((p) => p.id !== playerId) ?? null;
    const isMyTurn = room?.current_turn === playerId && room?.status === 'playing';

    // Fetch the latest room data from Supabase
    const fetchRoom = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('rooms')
                .select('*')
                .eq('room_code', roomCode)
                .single();

            if (fetchError) {
                console.error('[GameEngine] Fetch error:', fetchError.message);
                setError(`Error al cargar la sala: ${fetchError.message}`);
                return;
            }

            if (data) {
                setRoom(data as Room);
                setError(null);
            }
        } catch (err) {
            console.error('[GameEngine] Connection error:', err);
            setError(`Error de conexión: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, [roomCode]);

    // Set up Realtime subscription + polling fallback
    useEffect(() => {
        // Initial fetch
        fetchRoom();

        // --- Realtime subscription ---
        console.log('[GameEngine] Setting up Realtime for room:', roomCode);

        const channel = supabase
            .channel(`room-${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'rooms',
                    filter: `room_code=eq.${roomCode}`,
                },
                (payload) => {
                    console.log('[GameEngine] Realtime UPDATE received:', payload.new);
                    const updatedRoom = payload.new as Room;
                    setRoom(updatedRoom);
                    setError(null);
                    realtimeWorkingRef.current = true;
                }
            )
            .subscribe((status, err) => {
                console.log('[GameEngine] Subscription status:', status, err);
                if (status === 'CHANNEL_ERROR') {
                    console.warn('[GameEngine] Channel error, will rely on polling');
                    setError('Conexión en tiempo real interrumpida. Usando actualización automática...');
                    realtimeWorkingRef.current = false;
                }
                if (status === 'SUBSCRIBED') {
                    console.log('[GameEngine] Realtime subscribed successfully');
                    setError(null);
                }
            });

        channelRef.current = channel;

        // --- Polling fallback ---
        // Always poll, but especially important if Realtime isn't working
        pollIntervalRef.current = setInterval(() => {
            // Only poll when it's NOT my turn (waiting for opponent)
            // or if Realtime hasn't proven itself yet
            fetchRoom();
        }, POLL_INTERVAL_MS);

        return () => {
            console.log('[GameEngine] Cleaning up subscriptions');
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [roomCode, fetchRoom]);

    // Roll dice function
    const rollDice = useCallback(async () => {
        if (!room || !isMyTurn || isRolling || room.status !== 'playing') {
            console.log('[GameEngine] rollDice blocked:', {
                hasRoom: !!room,
                isMyTurn,
                isRolling,
                status: room?.status,
                currentTurn: room?.current_turn,
                playerId,
            });
            return;
        }

        setIsRolling(true);
        setLastMoveInfo(null);

        try {
            // Generate random dice value
            const diceResult = (Math.floor(Math.random() * 6) + 1) as DiceValue;
            console.log('[GameEngine] Dice rolled:', diceResult);

            // Find current player in the players array
            const currentPlayerIndex = room.players.findIndex((p) => p.id === playerId);
            if (currentPlayerIndex === -1) {
                console.error('[GameEngine] Player not found in room:', playerId);
                return;
            }

            const currentPlayer = room.players[currentPlayerIndex];
            const currentPos = currentPlayer.position;

            // Compute move with snakes and ladders
            const { finalPosition, hitSnake, hitLadder, intermediatePosition } = computeMove(
                currentPos,
                diceResult
            );

            console.log('[GameEngine] Move:', currentPos, '->', finalPosition,
                hitSnake ? '(SNAKE)' : hitLadder ? '(LADDER)' : '');

            // Update players array
            const updatedPlayers: Player[] = [...room.players];
            updatedPlayers[currentPlayerIndex] = {
                ...currentPlayer,
                position: finalPosition,
            };

            // Check win condition
            const isWinner = finalPosition === 100;

            // Determine next turn
            const otherPlayer = room.players.find((p) => p.id !== playerId);
            const nextTurn = isWinner ? null : otherPlayer?.id ?? null;

            // Update the room in Supabase
            const { error: updateError } = await supabase
                .from('rooms')
                .update({
                    players: updatedPlayers,
                    current_turn: nextTurn,
                    dice_value: diceResult,
                    last_move: new Date().toISOString(),
                    winner: isWinner ? playerId : null,
                    status: isWinner ? 'finished' : 'playing',
                })
                .eq('room_code', roomCode);

            if (updateError) {
                console.error('[GameEngine] Update error:', updateError);
                setError(`Error al actualizar: ${updateError.message}`);
                return;
            }

            console.log('[GameEngine] Room updated successfully');

            // Optimistic update — apply locally right away
            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    players: updatedPlayers,
                    current_turn: nextTurn,
                    dice_value: diceResult,
                    last_move: new Date().toISOString(),
                    winner: isWinner ? playerId : null,
                    status: isWinner ? 'finished' : 'playing',
                };
            });

            setLastMoveInfo({ hitSnake, hitLadder, intermediatePosition });
        } catch (err) {
            console.error('[GameEngine] Roll error:', err);
            setError(`Error: ${(err as Error).message}`);
        } finally {
            // Small delay so dice animation completes
            setTimeout(() => setIsRolling(false), 800);
        }
    }, [room, isMyTurn, isRolling, playerId, roomCode]);

    return {
        room,
        myPlayer,
        opponent,
        isMyTurn,
        isLoading,
        error,
        rollDice,
        diceValue: room?.dice_value ?? 0,
        isRolling,
        lastMoveInfo,
    };
}
