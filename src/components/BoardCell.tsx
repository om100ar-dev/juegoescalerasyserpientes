import { cellToGridPosition } from '../constants/board';
import { PlayerToken } from './PlayerToken';
import type { Player } from '../types/game';
import type { AnimationPhase } from '../hooks/useLocalGame';

interface BoardCellProps {
    cellNumber: number;
    players: Player[];
    currentTurnId: string | null;
    animationPhase?: AnimationPhase;
}

/**
 * Pastel color palette matching the reference physical board.
 */
const PASTEL_COLORS = [
    'bg-cyan-200/80',     // cyan
    'bg-orange-200/70',   // peach
    'bg-purple-200/70',   // lavender
    'bg-pink-200/70',     // pink
];

function getCellColor(cellNumber: number): string {
    const { row, col } = cellToGridPosition(cellNumber);
    const index = (row + col) % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
}

export function BoardCell({ cellNumber, players, currentTurnId, animationPhase = 'idle' }: BoardCellProps) {
    const playersOnCell = players.filter((p) => p.position === cellNumber);

    let bgClass: string;
    let extraClasses = '';

    if (cellNumber === 100) {
        bgClass = 'bg-amber-300/90';
        extraClasses = 'ring-2 ring-amber-500/60';
    } else if (cellNumber === 1) {
        bgClass = 'bg-emerald-300/80';
        extraClasses = 'ring-2 ring-emerald-500/50';
    } else {
        bgClass = getCellColor(cellNumber);
    }

    return (
        <div
            className={`
                relative flex flex-col items-center justify-center
                aspect-square rounded-sm
                transition-all duration-200
                ${bgClass} ${extraClasses}
            `}
            title={`Casilla ${cellNumber}`}
        >
            {/* Cell number */}
            <span className={`font-bold font-mono text-[10px] md:text-xs leading-none z-[6] ${cellNumber === 100 || cellNumber === 1
                    ? 'text-slate-800'
                    : 'text-slate-600/90'
                }`}>
                {cellNumber}
            </span>

            {/* Special labels */}
            {cellNumber === 100 && (
                <span className="text-[8px] md:text-[10px] font-bold text-amber-800 z-[6]">
                    ★ META
                </span>
            )}
            {cellNumber === 1 && (
                <span className="text-[8px] md:text-[10px] font-bold text-emerald-800 z-[6]">
                    ► START
                </span>
            )}

            {/* Player tokens */}
            {playersOnCell.map((player) => {
                const playerIndex = players.findIndex((p) => p.id === player.id);
                const isCurrentTurn = currentTurnId === player.id;
                return (
                    <PlayerToken
                        key={player.id}
                        avatar={player.avatar}
                        playerIndex={playerIndex}
                        isCurrentTurn={isCurrentTurn}
                        animationPhase={isCurrentTurn ? animationPhase : 'idle'}
                    />
                );
            })}
        </div>
    );
}
