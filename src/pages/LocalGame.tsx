import { useState } from 'react';
import { useLocalGame, MEEPLE_COLORS } from '../hooks/useLocalGame';
import { GameBoard } from '../components/GameBoard';
import { Dice } from '../components/Dice';
import { GameOverModal } from '../components/GameOverModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function LocalGame() {
    const navigate = useNavigate();
    const {
        room,
        isRolling,
        isAnimating,
        animationPhase,
        lastMoveInfo,
        startGame,
        rollDice,
        resetGame,
    } = useLocalGame();

    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');

    // If game not started, show setup form
    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex flex-col">
                {/* Fun background decorations */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🎲</div>
                    <div className="absolute top-20 right-16 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>🐍</div>
                    <div className="absolute bottom-20 left-16 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>🪜</div>
                    <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</div>
                </div>

                <main className="relative z-10 flex-1 flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-6 p-4 md:p-8 max-w-md mx-auto w-full">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 drop-shadow-lg">
                                🎮 ¡Juego Local!
                            </h1>
                            <p className="text-purple-700/70 mt-2 text-lg font-medium">
                                Dos jugadores en la misma pantalla
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl border-2 border-purple-300/60 rounded-3xl p-6 w-full shadow-xl shadow-purple-200/30">
                            <h2 className="text-lg font-bold text-purple-800 mb-4">
                                👫 Nombres de los jugadores
                            </h2>

                            <label className="block mb-3">
                                <span className="text-sm text-purple-600 mb-1 flex items-center gap-1.5 font-semibold">
                                    <span className="inline-block w-4 h-4 rounded-full shadow-sm" style={{ background: MEEPLE_COLORS[0].fill }} />
                                    Jugador 1 (Rojo)
                                </span>
                                <input
                                    type="text"
                                    value={player1Name}
                                    onChange={(e) => setPlayer1Name(e.target.value)}
                                    placeholder="Escribe tu nombre..."
                                    maxLength={20}
                                    className="w-full px-4 py-3 bg-white border-2 border-red-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-base"
                                />
                            </label>

                            <label className="block mb-5">
                                <span className="text-sm text-purple-600 mb-1 flex items-center gap-1.5 font-semibold">
                                    <span className="inline-block w-4 h-4 rounded-full shadow-sm" style={{ background: MEEPLE_COLORS[1].fill }} />
                                    Jugador 2 (Azul)
                                </span>
                                <input
                                    type="text"
                                    value={player2Name}
                                    onChange={(e) => setPlayer2Name(e.target.value)}
                                    placeholder="Escribe tu nombre..."
                                    maxLength={20}
                                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all text-base"
                                />
                            </label>

                            <button
                                onClick={() => startGame(player1Name, player2Name)}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                            >
                                🚀 ¡Empezar Juego!
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors cursor-pointer"
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Active game
    const currentPlayer = room.players.find((p) => p.id === room.current_turn);
    const currentPlayerIndex = room.players.findIndex((p) => p.id === room.current_turn);
    const winnerPlayer = room.winner ? room.players.find((p) => p.id === room.winner) : null;
    const currentMeepleColor = MEEPLE_COLORS[currentPlayerIndex] ?? MEEPLE_COLORS[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-teal-50 to-yellow-100">
            {/* Fun subtle background shapes */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl" />
            </div>

            {/* Floating turn indicator */}
            <AnimatePresence mode="wait">
                {currentPlayer && room.status === 'playing' && (
                    <motion.div
                        key={currentPlayer.id}
                        className="fixed top-3 left-1/2 z-50 pointer-events-none"
                        initial={{ opacity: 0, y: -30, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <div
                            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg border-2 backdrop-blur-sm"
                            style={{
                                background: `linear-gradient(135deg, white, ${currentMeepleColor.fill}15)`,
                                borderColor: `${currentMeepleColor.fill}50`,
                                boxShadow: `0 4px 20px ${currentMeepleColor.fill}25`,
                            }}
                        >
                            {/* Mini meeple */}
                            <svg viewBox="0 0 40 44" width="22" height="26">
                                <path
                                    d="M20 8 C20 8 14 12 12 18 C10 24 6 26 4 30 L4 36 L16 36 L16 30 L24 30 L24 36 L36 36 L36 30 C34 26 30 24 28 18 C26 12 20 8 20 8 Z"
                                    fill={currentMeepleColor.fill}
                                    stroke={currentMeepleColor.stroke}
                                    strokeWidth="1.5"
                                />
                                <circle cx="20" cy="8" r="6" fill={currentMeepleColor.fill} stroke={currentMeepleColor.stroke} strokeWidth="1.5" />
                            </svg>

                            <span className="text-slate-700 font-bold text-sm whitespace-nowrap">
                                {isAnimating
                                    ? animationPhase === 'snake'
                                        ? '🐍 ¡Serpiente!'
                                        : animationPhase === 'ladder'
                                            ? '🪜 ¡Escalera!'
                                            : '🎲 Moviendo...'
                                    : `Turno de ${currentPlayer.name}`
                                }
                            </span>

                            {/* Pulse dot */}
                            <motion.div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: currentMeepleColor.fill }}
                                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Snake/Ladder event overlay splash */}
            <AnimatePresence>
                {(animationPhase === 'snake' || animationPhase === 'ladder') && (
                    <motion.div
                        className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Soft colored backdrop */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: animationPhase === 'snake'
                                    ? 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 60%)'
                                    : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="text-8xl md:text-9xl"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: [0, 1.3, 1], rotate: [0, 10, 0] }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'backOut' }}
                        >
                            {animationPhase === 'snake' ? '🐍' : '🪜'}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:py-6 pt-16">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                            🐍 Serpientes y Escaleras
                        </h1>
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full border border-green-300 font-bold">
                            Local
                        </span>
                    </div>
                </header>

                {/* Snake/Ladder notification banner */}
                <AnimatePresence>
                    {lastMoveInfo && (lastMoveInfo.hitSnake || lastMoveInfo.hitLadder) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className={`mb-4 px-4 py-3 rounded-2xl text-sm border-2 font-bold ${lastMoveInfo.hitSnake
                                ? 'bg-red-50 border-red-300 text-red-600'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                }`}
                        >
                            {lastMoveInfo.hitSnake
                                ? `🐍 ¡Serpiente! Cayó de la casilla ${lastMoveInfo.intermediatePosition}`
                                : `🪜 ¡Escalera! Subió desde la casilla ${lastMoveInfo.intermediatePosition}`}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main game layout */}
                <div className="flex flex-col lg:flex-row items-start gap-6">
                    {/* Board */}
                    <div className="flex-1 w-full">
                        <GameBoard
                            players={room.players}
                            currentTurnId={room.current_turn}
                            animationPhase={animationPhase}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-72 flex flex-col gap-4">
                        {/* Players panel */}
                        <div className="bg-white/80 backdrop-blur-xl border-2 border-purple-200/60 rounded-3xl p-4 shadow-lg shadow-purple-100/30">
                            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">
                                👫 Jugadores
                            </h3>
                            <div className="space-y-3">
                                {room.players.map((player, pIndex) => {
                                    const meeple = MEEPLE_COLORS[pIndex];
                                    const isActive = room.current_turn === player.id;
                                    return (
                                        <div
                                            key={player.id}
                                            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${isActive
                                                ? 'shadow-md'
                                                : 'bg-white/50 border-slate-200'
                                                }`}
                                            style={isActive ? {
                                                background: `${meeple.fill}10`,
                                                borderColor: `${meeple.fill}40`,
                                                boxShadow: `0 2px 12px ${meeple.fill}15`,
                                            } : undefined}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {/* Mini meeple icon */}
                                                <svg viewBox="0 0 40 44" width="28" height="32">
                                                    <path
                                                        d="M20 8 C20 8 14 12 12 18 C10 24 6 26 4 30 L4 36 L16 36 L16 30 L24 30 L24 36 L36 36 L36 30 C34 26 30 24 28 18 C26 12 20 8 20 8 Z"
                                                        fill={meeple.fill}
                                                        stroke={meeple.stroke}
                                                        strokeWidth="1.5"
                                                        strokeLinejoin="round"
                                                    />
                                                    <circle cx="20" cy="8" r="6" fill={meeple.fill} stroke={meeple.stroke} strokeWidth="1.5" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{player.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        Casilla: {player.position || 'Inicio'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isActive && (
                                                <motion.span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ background: meeple.fill }}
                                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dice panel */}
                        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200/60 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-orange-100/30">
                            <Dice
                                value={room.dice_value}
                                isMyTurn={!isAnimating && room.status === 'playing'}
                                isRolling={isRolling}
                                onRoll={rollDice}
                                disabled={room.status !== 'playing' || isAnimating}
                            />
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => navigate('/')}
                            className="text-purple-400 hover:text-purple-600 text-sm font-medium transition-colors text-center cursor-pointer"
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                </div>
            </div>

            {/* Game Over */}
            <GameOverModal
                isOpen={room.status === 'finished' && winnerPlayer !== null && winnerPlayer !== undefined}
                winnerName={winnerPlayer?.name ?? ''}
                winnerAvatar={winnerPlayer?.avatar ?? ''}
                isMe={true}
                onPlayAgain={resetGame}
            />
        </div>
    );
}
