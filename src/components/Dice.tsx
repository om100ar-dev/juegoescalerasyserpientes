import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DiceProps {
    value: number;
    isMyTurn: boolean;
    isRolling: boolean;
    onRoll: () => void;
    disabled: boolean;
}

/** Dice face dot patterns (1-6) as [row, col] positions in a 3x3 grid */
const DICE_DOTS: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 2], [2, 0]],
    3: [[0, 2], [1, 1], [2, 0]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value }: { value: number }) {
    const dots = DICE_DOTS[value] || [];

    return (
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] border-2 border-slate-200 grid grid-cols-3 grid-rows-3 p-2.5 md:p-3 gap-0">
            {Array.from({ length: 9 }).map((_, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const hasDot = dots.some(([r, c]) => r === row && c === col);

                return (
                    <div key={index} className="flex items-center justify-center">
                        {hasDot && (
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 shadow-inner" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function Dice({ value, isMyTurn, isRolling, onRoll, disabled }: DiceProps) {
    const [flickerValue, setFlickerValue] = useState(value || 1);

    // While rolling, rapidly flicker through random dice faces
    useEffect(() => {
        if (!isRolling) {
            setFlickerValue(value || 1);
            return;
        }

        let count = 0;
        const maxFlickers = 18;
        const interval = setInterval(() => {
            setFlickerValue(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count >= maxFlickers) {
                clearInterval(interval);
                setFlickerValue(value || 1);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isRolling, value]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Single dice — dramatic throw animation */}
            <motion.div
                className="relative"
                style={{ perspective: '600px' }}
                animate={
                    isRolling
                        ? {
                            // Dice jumps up, bounces, and spins
                            y: [0, -60, -20, -40, -10, 0],
                            x: [0, -15, 20, -10, 5, 0],
                            scale: [1, 1.3, 0.9, 1.15, 0.95, 1],
                        }
                        : { y: 0, x: 0, scale: 1 }
                }
                transition={
                    isRolling
                        ? {
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        }
                        : { duration: 0.3, ease: 'easeOut' }
                }
            >
                <motion.div
                    animate={
                        isRolling
                            ? {
                                rotateX: [0, 360, 720],
                                rotateY: [0, -180, -360],
                                rotateZ: [0, 90, 0],
                            }
                            : { rotateX: 0, rotateY: 0, rotateZ: 0 }
                    }
                    transition={
                        isRolling
                            ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                            : { duration: 0.3, ease: 'easeOut' }
                    }
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <DiceFace value={isRolling ? flickerValue : (value || 1)} />
                </motion.div>

                {/* Shadow that responds to the dice height */}
                <motion.div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/15 rounded-full blur-sm"
                    animate={
                        isRolling
                            ? {
                                scaleX: [1, 0.5, 1.1, 0.6, 1.05, 1],
                                scaleY: [1, 0.4, 1.2, 0.5, 1.1, 1],
                                opacity: [0.3, 0.1, 0.4, 0.15, 0.35, 0.3],
                            }
                            : { scaleX: 1, scaleY: 1, opacity: 0.3 }
                    }
                    transition={
                        isRolling
                            ? { duration: 0.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                            : { duration: 0.3 }
                    }
                />
            </motion.div>

            {/* Roll button */}
            <button
                onClick={onRoll}
                disabled={disabled || !isMyTurn || isRolling}
                className={`
                    px-7 py-3.5 rounded-2xl font-bold text-sm md:text-base
                    transition-all duration-300 transform
                    ${isMyTurn && !disabled && !isRolling
                        ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-400/40 hover:shadow-orange-400/60 hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                    }
                `}
            >
                {isRolling ? '🎲 Lanzando...' : isMyTurn ? '🎲 Lanzar Dado' : '⏳ Esperando...'}
            </button>
        </div>
    );
}
