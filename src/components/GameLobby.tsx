import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';
import type { Player } from '../types/game';

const AVATARS = ['🎮', '🎯', '🚀', '⭐', '🔥', '💎', '🌟', '🎪'];

export function GameLobby() {
    const navigate = useNavigate();

    const [playerName, setPlayerName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);

    const generateRoomCode = (): string => {
        return nanoid(6).toUpperCase();
    };

    const createRoom = async () => {
        if (!playerName.trim()) {
            setError('Ingresa tu nombre para continuar');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const playerId = nanoid(10);
            const code = generateRoomCode();

            const player: Player = {
                id: playerId,
                name: playerName.trim(),
                position: 0,
                avatar: selectedAvatar,
            };

            const { error: insertError } = await supabase.from('rooms').insert({
                room_code: code,
                players: [player],
                current_turn: null,
                status: 'waiting',
            });

            if (insertError) {
                setError(`Error al crear sala: ${insertError.message}`);
                return;
            }

            sessionStorage.setItem('playerId', playerId);
            sessionStorage.setItem('playerName', playerName.trim());

            setRoomCode(code);
            setIsWaiting(true);

            const channel = supabase
                .channel(`lobby-${code}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'rooms',
                        filter: `room_code=eq.${code}`,
                    },
                    (payload) => {
                        const updatedRoom = payload.new as { status: string; room_code: string };
                        if (updatedRoom.status === 'playing') {
                            supabase.removeChannel(channel);
                            navigate(`/game/${code}`);
                        }
                    }
                )
                .subscribe();
        } catch (err) {
            setError(`Error: ${(err as Error).message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = async () => {
        if (!playerName.trim()) {
            setError('Ingresa tu nombre para continuar');
            return;
        }
        if (!joinCode.trim()) {
            setError('Ingresa el código de la sala');
            return;
        }

        setIsJoining(true);
        setError(null);

        try {
            const playerId = nanoid(10);

            const { data: room, error: fetchError } = await supabase
                .from('rooms')
                .select('*')
                .eq('room_code', joinCode.trim().toUpperCase())
                .single();

            if (fetchError || !room) {
                setError('Sala no encontrada. Verifica el código.');
                return;
            }

            if (room.status !== 'waiting') {
                setError('Esta sala ya está en juego o ha terminado.');
                return;
            }

            const existingPlayers = room.players as Player[];
            if (existingPlayers.length >= 2) {
                setError('La sala ya está llena.');
                return;
            }

            const newPlayer: Player = {
                id: playerId,
                name: playerName.trim(),
                position: 0,
                avatar: selectedAvatar,
            };

            const updatedPlayers = [...existingPlayers, newPlayer];

            const { error: updateError } = await supabase
                .from('rooms')
                .update({
                    players: updatedPlayers,
                    current_turn: existingPlayers[0].id,
                    status: 'playing',
                })
                .eq('room_code', joinCode.trim().toUpperCase());

            if (updateError) {
                setError(`Error al unirse: ${updateError.message}`);
                return;
            }

            sessionStorage.setItem('playerId', playerId);
            sessionStorage.setItem('playerName', playerName.trim());

            navigate(`/game/${joinCode.trim().toUpperCase()}`);
        } catch (err) {
            setError(`Error: ${(err as Error).message}`);
        } finally {
            setIsJoining(false);
        }
    };

    if (isWaiting && roomCode) {
        return (
            <div className="flex flex-col items-center gap-6 p-8">
                <div className="bg-white/80 backdrop-blur-xl border-2 border-purple-200/60 rounded-3xl p-8 text-center max-w-md w-full shadow-lg shadow-purple-100/30">
                    <div className="text-5xl mb-4 animate-bounce">⏳</div>
                    <h2 className="text-xl font-bold text-purple-800 mb-2">Esperando oponente...</h2>
                    <p className="text-purple-500 mb-6">Comparte este código con tu oponente:</p>

                    <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 mb-4">
                        <p className="text-3xl font-mono font-bold tracking-[0.3em] text-purple-600">
                            {roomCode}
                        </p>
                    </div>

                    <button
                        onClick={() => navigator.clipboard.writeText(roomCode)}
                        className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-xl transition-colors cursor-pointer font-medium"
                    >
                        📋 Copiar código
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Conectado y esperando...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-5 max-w-lg mx-auto w-full">
            {/* Title */}
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500">
                    🐍 Serpientes y Escaleras 🪜
                </h2>
                <p className="text-purple-500/70 mt-1 font-medium">Juego multijugador en tiempo real</p>
            </div>

            {/* Player setup card */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-teal-200/60 rounded-3xl p-6 w-full shadow-lg shadow-teal-100/30">
                <h3 className="text-lg font-bold text-teal-700 mb-4">Tu perfil</h3>

                <label className="block mb-3">
                    <span className="text-sm text-teal-600 mb-1 block font-semibold">Nombre</span>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Ingresa tu nombre..."
                        maxLength={20}
                        className="w-full px-4 py-3 bg-white border-2 border-teal-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all text-base"
                    />
                </label>

                <div className="mb-2">
                    <span className="text-sm text-teal-600 mb-2 block font-semibold">Avatar</span>
                    <div className="flex gap-2 flex-wrap">
                        {AVATARS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`
                                    w-11 h-11 rounded-xl text-xl flex items-center justify-center
                                    transition-all duration-200 cursor-pointer
                                    ${selectedAvatar === avatar
                                        ? 'bg-teal-100 border-2 border-teal-400 scale-110 shadow-sm'
                                        : 'bg-slate-100 border-2 border-slate-200 hover:bg-slate-200'
                                    }
                                `}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="w-full px-4 py-3 bg-red-50 border-2 border-red-300 rounded-2xl text-red-600 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Create room */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-green-200/60 rounded-3xl p-6 w-full shadow-lg shadow-green-100/30">
                <h3 className="text-lg font-bold text-green-700 mb-3">Crear sala nueva</h3>
                <button
                    onClick={createRoom}
                    disabled={isCreating}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-400/20 hover:shadow-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isCreating ? '⏳ Creando...' : '🎮 Crear Sala'}
                </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-purple-300/40" />
                <span className="text-purple-400 text-sm font-medium">o</span>
                <div className="flex-1 h-px bg-purple-300/40" />
            </div>

            {/* Join room */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-indigo-200/60 rounded-3xl p-6 w-full shadow-lg shadow-indigo-100/30">
                <h3 className="text-lg font-bold text-indigo-700 mb-3">Unirse a una sala</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Código..."
                        maxLength={6}
                        className="flex-1 px-4 py-3 bg-white border-2 border-indigo-200 rounded-2xl text-slate-800 font-mono tracking-widest uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all text-base"
                    />
                    <button
                        onClick={joinRoom}
                        disabled={isJoining}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-400/20 hover:shadow-indigo-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isJoining ? '⏳' : '🚀 Unirse'}
                    </button>
                </div>
            </div>
        </div>
    );
}
