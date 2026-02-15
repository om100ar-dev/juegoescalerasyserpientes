import { useParams, useNavigate } from 'react-router-dom';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameBoard } from '../components/GameBoard';
import { Dice } from '../components/Dice';
import { TurnIndicator } from '../components/TurnIndicator';
import { GameOverModal } from '../components/GameOverModal';

export function Game() {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();

    const playerId = sessionStorage.getItem('playerId') ?? '';

    const {
        room,
        myPlayer,
        opponent,
        isMyTurn,
        isLoading,
        error,
        rollDice,
        diceValue,
        isRolling,
        lastMoveInfo,
    } = useGameEngine({
        roomCode: roomCode ?? '',
        playerId,
    });

    if (!roomCode || !playerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center">
                <div className="text-center p-8 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                    <p className="text-red-400 mb-4">⚠️ Sesión no encontrada</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors cursor-pointer"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-bounce">🎲</div>
                    <p className="text-slate-400 animate-pulse">Cargando partida...</p>
                </div>
            </div>
        );
    }

    const winnerPlayer = room?.winner
        ? room.players.find((p) => p.id === room.winner)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
            {/* Decorative backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:py-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            🐍 Serpientes y Escaleras
                        </h1>
                        <span className="px-2 py-0.5 text-xs bg-slate-800/60 text-slate-400 rounded-lg border border-slate-700/50 font-mono">
                            Sala: {roomCode}
                        </span>
                    </div>

                    <TurnIndicator
                        myPlayer={myPlayer}
                        opponent={opponent}
                        isMyTurn={isMyTurn}
                        gameStatus={room?.status ?? 'waiting'}
                    />
                </header>

                {/* Error bar */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-950/50 border border-red-700/40 rounded-xl text-red-300 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Move info notification */}
                {lastMoveInfo && (lastMoveInfo.hitSnake || lastMoveInfo.hitLadder) && (
                    <div
                        className={`mb-4 px-4 py-3 rounded-xl text-sm border ${lastMoveInfo.hitSnake
                                ? 'bg-red-950/50 border-red-700/40 text-red-300'
                                : 'bg-emerald-950/50 border-emerald-700/40 text-emerald-300'
                            }`}
                    >
                        {lastMoveInfo.hitSnake
                            ? `🐍 ¡Serpiente! Caíste de la casilla ${lastMoveInfo.intermediatePosition}`
                            : `🪜 ¡Escalera! Subiste desde la casilla ${lastMoveInfo.intermediatePosition}`}
                    </div>
                )}

                {/* Main game layout */}
                <div className="flex flex-col lg:flex-row items-start gap-6">
                    {/* Board */}
                    <div className="flex-1 w-full">
                        <GameBoard
                            players={room?.players ?? []}
                            currentTurnId={room?.current_turn ?? null}
                        />
                    </div>

                    {/* Sidebar: Players + Dice */}
                    <div className="w-full lg:w-72 flex flex-col gap-4">
                        {/* Players panel */}
                        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Jugadores
                            </h3>
                            <div className="space-y-3">
                                {room?.players.map((player) => (
                                    <div
                                        key={player.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${room.current_turn === player.id
                                                ? 'bg-amber-900/20 border-amber-500/30'
                                                : 'bg-slate-900/40 border-slate-700/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{player.avatar}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {player.name}
                                                    {player.id === playerId && (
                                                        <span className="ml-1 text-xs text-emerald-400">(tú)</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Posición: {player.position || 'Inicio'}
                                                </p>
                                            </div>
                                        </div>
                                        {room.current_turn === player.id && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dice panel */}
                        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center justify-center">
                            <Dice
                                value={diceValue}
                                isMyTurn={isMyTurn}
                                isRolling={isRolling}
                                onRoll={rollDice}
                                disabled={room?.status !== 'playing'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={room?.status === 'finished' && winnerPlayer !== null && winnerPlayer !== undefined}
                winnerName={winnerPlayer?.name ?? ''}
                winnerAvatar={winnerPlayer?.avatar ?? ''}
                isMe={winnerPlayer?.id === playerId}
                onPlayAgain={() => navigate('/')}
            />
        </div>
    );
}
