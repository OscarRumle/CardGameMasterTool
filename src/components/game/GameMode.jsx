import { useState } from 'react';
import HeroSelection from './HeroSelection';

function GameMode({ decks }) {
  const [gamePhase, setGamePhase] = useState('hero-select'); // 'hero-select', 'playing', 'game-over'
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGamePhase('playing');
    console.log('Starting game with config:', config);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      {gamePhase === 'hero-select' && (
        <HeroSelection decks={decks} onStartGame={handleStartGame} />
      )}

      {gamePhase === 'playing' && gameConfig && (
        <div className="text-white text-center p-8">
          <h1 className="text-3xl font-bold">GAME BOARD</h1>
          <p className="text-zinc-400 mt-4">
            You ({gameConfig.player.hero}) vs AI ({gameConfig.ai.hero})
          </p>
          <p className="text-zinc-500 mt-2">Game board coming next...</p>
        </div>
      )}

      {gamePhase === 'game-over' && (
        <div className="text-white text-center p-8">
          <h1 className="text-3xl font-bold">GAME OVER</h1>
        </div>
      )}
    </div>
  );
}

export default GameMode;
