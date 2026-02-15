import { buildBoardLayout } from '../constants/board';
import { BoardCell } from './BoardCell';
import { BoardOverlay } from './BoardOverlay';
import type { Player } from '../types/game';
import type { AnimationPhase } from '../hooks/useLocalGame';

interface GameBoardProps {
    players: Player[];
    currentTurnId: string | null;
    animationPhase?: AnimationPhase;
}

const boardLayout = buildBoardLayout();

export function GameBoard({ players, currentTurnId, animationPhase = 'idle' }: GameBoardProps) {
    return (
        <div className="w-full max-w-[600px] mx-auto">
            {/* Board wrapper — colorful style like a physical board */}
            <div className="relative bg-cyan-300/40 backdrop-blur-sm rounded-2xl p-2 md:p-3 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-900/20">
                {/* Cell grid */}
                <div className="grid grid-cols-10 gap-[2px]">
                    {boardLayout.map((row) =>
                        row.map((cellNumber) => (
                            <BoardCell
                                key={cellNumber}
                                cellNumber={cellNumber}
                                players={players}
                                currentTurnId={currentTurnId}
                                animationPhase={animationPhase}
                            />
                        ))
                    )}
                </div>

                {/* SVG snakes and ladders overlay */}
                <BoardOverlay />
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 2 Q12 6, 4 10 Q12 14, 8 15" fill="none" stroke="#2d9e8f" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="4" cy="2" r="2" fill="#1a7a6e" />
                    </svg>
                    Serpiente
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <line x1="4" y1="2" x2="4" y2="14" stroke="#8B6F5E" strokeWidth="1.8" />
                        <line x1="12" y1="2" x2="12" y2="14" stroke="#8B6F5E" strokeWidth="1.8" />
                        <line x1="4" y1="5" x2="12" y2="5" stroke="#8B6F5E" strokeWidth="1" />
                        <line x1="4" y1="8" x2="12" y2="8" stroke="#8B6F5E" strokeWidth="1" />
                        <line x1="4" y1="11" x2="12" y2="11" stroke="#8B6F5E" strokeWidth="1" />
                    </svg>
                    Escalera
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-sm">★</span>
                    Meta
                </span>
            </div>
        </div>
    );
}
