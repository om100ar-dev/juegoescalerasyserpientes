import { motion, AnimatePresence } from 'framer-motion';

interface GameOverModalProps {
    isOpen: boolean;
    winnerName: string;
    winnerAvatar: string;
    isMe: boolean;
    onPlayAgain: () => void;
}

export function GameOverModal({
    isOpen,
    winnerName,
    isMe,
    onPlayAgain,
}: GameOverModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-white/60 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-white/95 backdrop-blur-xl border-2 border-yellow-300 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl shadow-yellow-200/40"
                        initial={{ scale: 0.5, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.5, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        {/* Top emoji */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl">
                            {isMe ? '🎉' : '🎊'}
                        </div>

                        {/* Trophy */}
                        <motion.div
                            className="text-8xl mb-4"
                            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        >
                            🏆
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 mb-3">
                            ¡Ganaste!
                        </h2>
                        <p className="text-slate-600 text-lg mb-6">
                            <span className="font-extrabold text-purple-600">{winnerName}</span>
                            {' ha llegado a la casilla 100 🌟'}
                        </p>

                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-6 text-3xl">
                            <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}>⭐</motion.span>
                            <motion.span animate={{ rotate: [0, -20, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}>⭐</motion.span>
                            <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}>⭐</motion.span>
                        </div>

                        {/* Play again */}
                        <button
                            onClick={onPlayAgain}
                            className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                        >
                            🔄 ¡Jugar Otra Vez!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
