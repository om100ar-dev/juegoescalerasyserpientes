import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { LocalGame } from './pages/LocalGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:roomCode" element={<Game />} />
        <Route path="/local" element={<LocalGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
