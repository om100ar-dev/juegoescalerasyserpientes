import { motion } from 'framer-motion';
import { MEEPLE_COLORS } from '../hooks/useLocalGame';
import type { AnimationPhase } from '../hooks/useLocalGame';

interface PlayerTokenProps {
    avatar: string;
    playerIndex: number;
    isCurrentTurn: boolean;
    animationPhase?: AnimationPhase;
}

/** Classic board game meeple SVG shape */
function MeepleSvg({ color, strokeColor }: { color: string; strokeColor: string }) {
    return (
        <svg viewBox="0 0 40 44" width="100%" height="100%">
            {/* Shadow */}
            <ellipse cx="20" cy="42" rx="10" ry="2" fill="rgba(0,0,0,0.15)" />
            {/* Body */}
            <path
                d="M20 8 C20 8 14 12 12 18 C10 24 6 26 4 30 L4 36 L16 36 L16 30 L24 30 L24 36 L36 36 L36 30 C34 26 30 24 28 18 C26 12 20 8 20 8 Z"
                fill={color}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            {/* Head */}
            <circle cx="20" cy="8" r="6" fill={color} stroke={strokeColor} strokeWidth="1.5" />
            {/* Shine highlight */}
            <ellipse cx="17" cy="6" rx="2" ry="2.5" fill="rgba(255,255,255,0.35)" />
        </svg>
    );
}

export function PlayerToken({ playerIndex, isCurrentTurn, animationPhase = 'idle' }: PlayerTokenProps) {
    const colors = MEEPLE_COLORS[playerIndex] ?? MEEPLE_COLORS[0];

    // Offset tokens slightly so both are visible on the same cell
    const offsetX = playerIndex === 0 ? -8 : 8;
    const offsetY = playerIndex === 0 ? -2 : 2;

    // Get only subtle animations — NO scale changes during movement
    const getAnimation = () => {
        if (animationPhase === 'snake') {
            return {
                rotate: [0, -8, 8, -5, 5, 0],
                y: [0, 2, -2, 1, 0],
            };
        }

        if (animationPhase === 'ladder') {
            return {
                y: [0, -6, -3, -5, 0],
            };
        }

        // Gentle float for active turn player
        if (isCurrentTurn && animationPhase === 'idle') {
            return {
                y: [0, -3, 0],
            };
        }

        return { y: 0 };
    };

    return (
        <motion.div
            layout
            layoutId={`meeple-${playerIndex}`}
            className="absolute z-10 pointer-events-none"
            style={{
                width: '28px',
                height: '32px',
                left: `calc(50% + ${offsetX}px - 14px)`,
                top: `calc(50% + ${offsetY}px - 16px)`,
            }}
            animate={getAnimation()}
            transition={{
                // Movement speed depends on animation phase
                layout: {
                    type: 'tween',
                    duration: animationPhase === 'ladder'
                        ? 1.2   // Slow climb up the ladder
                        : animationPhase === 'snake'
                            ? 0.5   // Quick slide down the snake
                            : 0.25, // Normal step-by-step
                    ease: animationPhase === 'ladder' ? 'easeOut' : 'easeInOut',
                },
                y: isCurrentTurn && animationPhase === 'idle'
                    ? { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' }
                    : { duration: 0.5 },
                rotate: { duration: 0.8 },
            }}
        >
            <MeepleSvg color={colors.fill} strokeColor={colors.stroke} />

            {/* Glow effect for current turn */}
            {isCurrentTurn && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${colors.fill}50 0%, transparent 70%)`,
                        filter: 'blur(6px)',
                    }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
        </motion.div>
    );
}
