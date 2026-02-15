interface TurnIndicatorProps {
    myPlayer: { name: string; avatar: string } | null;
    opponent: { name: string; avatar: string } | null;
    isMyTurn: boolean;
    gameStatus: string;
}

export function TurnIndicator({ myPlayer, opponent, isMyTurn, gameStatus }: TurnIndicatorProps) {
    if (gameStatus !== 'playing') return null;

    const activePlayer = isMyTurn ? myPlayer : opponent;

    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
            {/* Active player info */}
            <div
                className={`
          flex items-center gap-2 text-sm md:text-base font-semibold
          ${isMyTurn ? 'text-amber-400' : 'text-slate-300'}
        `}
            >
                <span
                    className={`
            inline-block w-3 h-3 rounded-full
            ${isMyTurn ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}
          `}
                />
                <span className="text-lg">{activePlayer?.avatar}</span>
                <span>
                    {isMyTurn ? '¡Tu turno!' : `Turno de ${activePlayer?.name ?? 'oponente'}`}
                </span>
            </div>
        </div>
    );
}
