import { useState, useCallback, useRef, useEffect } from 'react';
import { computeMove } from '../constants/board';
import type { Room, Player, DiceValue } from '../types/game';

/** Meeple colors for each player index */
export const MEEPLE_COLORS = [
    { fill: '#e53e3e', stroke: '#c53030', name: 'Rojo' },   // Red
    { fill: '#3182ce', stroke: '#2b6cb0', name: 'Azul' },   // Blue
];

/** Animation phase */
export type AnimationPhase = 'idle' | 'stepping' | 'snake' | 'ladder';

/**
 * Local game engine with step-by-step animation support.
 * Two players share the same screen and take turns.
 */
export function useLocalGame() {
    const [room, setRoom] = useState<Room | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [lastMoveInfo, setLastMoveInfo] = useState<{
        hitSnake: boolean;
        hitLadder: boolean;
        intermediatePosition: number;
    } | null>(null);

    // Animation state
    const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            animationTimeoutRef.current.forEach(clearTimeout);
        };
    }, []);

    const clearAnimationTimeouts = () => {
        animationTimeoutRef.current.forEach(clearTimeout);
        animationTimeoutRef.current = [];
    };

    /** Helper: update a player's position in the room */
    const updatePlayerPosition = useCallback((playerId: string, newPosition: number) => {
        setRoom((prev) => {
            if (!prev) return prev;
            const updatedPlayers = prev.players.map((p) =>
                p.id === playerId ? { ...p, position: newPosition } : p
            );
            return { ...prev, players: updatedPlayers };
        });
    }, []);

    // Start a local game with two players
    const startGame = useCallback((player1Name: string, player2Name: string) => {
        const player1: Player = {
            id: 'player-1',
            name: player1Name || 'Jugador 1',
            position: 0,
            avatar: '🔴',
        };
        const player2: Player = {
            id: 'player-2',
            name: player2Name || 'Jugador 2',
            position: 0,
            avatar: '🔵',
        };

        const newRoom: Room = {
            id: 'local-game',
            room_code: 'LOCAL',
            players: [player1, player2],
            current_turn: 'player-1',
            dice_value: 0,
            last_move: new Date().toISOString(),
            winner: null,
            status: 'playing',
            created_at: new Date().toISOString(),
        };

        setRoom(newRoom);
        setLastMoveInfo(null);
    }, []);

    // Roll the dice with step-by-step animation
    const rollDice = useCallback(() => {
        if (!room || room.status !== 'playing' || isRolling || isAnimating) return;

        setIsRolling(true);
        setLastMoveInfo(null);
        clearAnimationTimeouts();

        // Dice rolling animation delay
        const diceDelay = setTimeout(() => {
            const diceResult = (Math.floor(Math.random() * 6) + 1) as DiceValue;
            const currentPlayerId = room.current_turn!;
            const currentPlayer = room.players.find((p) => p.id === currentPlayerId)!;
            const startPos = currentPlayer.position;

            // Update dice value shown
            setRoom((prev) => prev ? { ...prev, dice_value: diceResult } : prev);
            setIsRolling(false);

            // Compute the final move result
            const { finalPosition, hitSnake, hitLadder, intermediatePosition } = computeMove(
                startPos,
                diceResult
            );

            // If can't move (exceeds 100), just end turn
            if (intermediatePosition === startPos) {
                const otherPlayer = room.players.find((p) => p.id !== currentPlayerId);
                setRoom((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        current_turn: otherPlayer?.id ?? null,
                    };
                });
                return;
            }

            // Build the step-by-step path
            const steps: number[] = [];
            const effectiveStart = startPos === 0 ? 0 : startPos;
            for (let pos = effectiveStart + 1; pos <= intermediatePosition; pos++) {
                steps.push(pos);
            }

            setIsAnimating(true);
            setAnimationPhase('stepping');

            // Animate step by step
            const STEP_DELAY = 350; // ms per step

            steps.forEach((stepPos, index) => {
                const timeout = setTimeout(() => {
                    updatePlayerPosition(currentPlayerId, stepPos);
                }, STEP_DELAY * (index + 1));
                animationTimeoutRef.current.push(timeout);
            });

            // After all steps complete, handle snake/ladder
            const afterStepsDelay = STEP_DELAY * (steps.length + 1);

            if (hitSnake || hitLadder) {
                // SLIDE_DELAY = how long the emoji overlay shows before meeple starts moving
                // The actual climb/slide speed is in PlayerToken (ladder: 1.2s, snake: 0.5s)
                const SLIDE_DELAY = 1200;
                const FINISH_DELAY = hitLadder ? 1400 : 800; // ladder needs more time for the slow climb

                // Pause at intermediate position, then slide/climb
                const snakeLadderTimeout = setTimeout(() => {
                    setAnimationPhase(hitSnake ? 'snake' : 'ladder');

                    // Animate to final position — ladders take longer so kids see the climb
                    const slideTimeout = setTimeout(() => {
                        updatePlayerPosition(currentPlayerId, finalPosition);
                        setLastMoveInfo({ hitSnake, hitLadder, intermediatePosition });

                        // Finish animation and switch turns
                        const finishTimeout = setTimeout(() => {
                            const isWinner = finalPosition === 100;
                            const otherPlayer = room.players.find((p) => p.id !== currentPlayerId);
                            const nextTurn = isWinner ? null : otherPlayer?.id ?? null;

                            setRoom((prev) => {
                                if (!prev) return prev;
                                const updatedPlayers = prev.players.map((p) =>
                                    p.id === currentPlayerId ? { ...p, position: finalPosition } : p
                                );
                                return {
                                    ...prev,
                                    players: updatedPlayers,
                                    current_turn: nextTurn,
                                    winner: isWinner ? currentPlayerId : null,
                                    status: isWinner ? 'finished' : 'playing',
                                };
                            });

                            setAnimationPhase('idle');
                            setIsAnimating(false);
                        }, FINISH_DELAY);
                        animationTimeoutRef.current.push(finishTimeout);
                    }, SLIDE_DELAY);
                    animationTimeoutRef.current.push(slideTimeout);
                }, afterStepsDelay);
                animationTimeoutRef.current.push(snakeLadderTimeout);
            } else {
                // No snake or ladder — just finish and switch turns
                const finishTimeout = setTimeout(() => {
                    const isWinner = finalPosition === 100;
                    const otherPlayer = room.players.find((p) => p.id !== currentPlayerId);
                    const nextTurn = isWinner ? null : otherPlayer?.id ?? null;

                    setRoom((prev) => {
                        if (!prev) return prev;
                        const updatedPlayers = prev.players.map((p) =>
                            p.id === currentPlayerId ? { ...p, position: finalPosition } : p
                        );
                        return {
                            ...prev,
                            players: updatedPlayers,
                            current_turn: nextTurn,
                            winner: isWinner ? currentPlayerId : null,
                            status: isWinner ? 'finished' : 'playing',
                        };
                    });

                    setAnimationPhase('idle');
                    setIsAnimating(false);
                }, afterStepsDelay);
                animationTimeoutRef.current.push(finishTimeout);
            }
        }, 600);
        animationTimeoutRef.current.push(diceDelay);
    }, [room, isRolling, isAnimating, updatePlayerPosition]);

    // Reset the game
    const resetGame = useCallback(() => {
        if (!room) return;
        clearAnimationTimeouts();
        const resetPlayers = room.players.map((p) => ({ ...p, position: 0 }));
        setRoom({
            ...room,
            players: resetPlayers,
            current_turn: 'player-1',
            dice_value: 0,
            winner: null,
            status: 'playing',
        });
        setLastMoveInfo(null);
        setAnimationPhase('idle');
        setIsAnimating(false);
    }, [room]);

    return {
        room,
        isRolling,
        isAnimating,
        animationPhase,
        lastMoveInfo,
        startGame,
        rollDice,
        resetGame,
    };
}
