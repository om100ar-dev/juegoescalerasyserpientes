import { useNavigate } from 'react-router-dom';
import { GameLobby } from '../components/GameLobby';

export function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex flex-col">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-8 text-5xl animate-bounce" style={{ animationDelay: '0s' }}>🐍</div>
                <div className="absolute top-16 right-12 text-4xl animate-bounce" style={{ animationDelay: '0.7s' }}>🪜</div>
                <div className="absolute bottom-16 left-12 text-4xl animate-bounce" style={{ animationDelay: '1.4s' }}>🎲</div>
                <div className="absolute bottom-10 right-8 text-5xl animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</div>
                <div className="absolute top-1/2 right-6 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🎮</div>
            </div>

            {/* Header */}
            <header className="relative z-10 text-center pt-10 pb-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                    🐍 Serpientes y Escaleras
                </h1>
                <p className="text-purple-600/60 mt-2 text-lg font-medium">
                    ¡El juego de mesa clásico!
                </p>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
                    {/* Local play button */}
                    <button
                        onClick={() => navigate('/local')}
                        className="w-full px-6 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-lg rounded-3xl shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer border-2 border-green-300/50"
                    >
                        🎮 Jugar Local (2 jugadores)
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 h-px bg-purple-300/40" />
                        <span className="text-purple-400 text-sm font-medium">o jugar online</span>
                        <div className="flex-1 h-px bg-purple-300/40" />
                    </div>

                    {/* Online lobby */}
                    <GameLobby />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-4 text-purple-400/60 text-xs font-medium">
                Serpientes y Escaleras — Multijugador en Tiempo Real
            </footer>
        </div>
    );
}
