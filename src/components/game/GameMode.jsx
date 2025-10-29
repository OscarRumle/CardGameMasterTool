import { useState } from 'react';
import HeroSelection from './HeroSelection';
import GameBoard from './GameBoard';
import { initializeGame, expandDeck } from '../../utils/gameEngine';

function GameMode({ decks }) {
  const [gamePhase, setGamePhase] = useState('hero-select'); // 'hero-select', 'playing', 'game-over'
  const [gameConfig, setGameConfig] = useState(null);
  const [gameState, setGameState] = useState(null);

  const handleStartGame = (config) => {
    // Expand decks based on Copies field
    const expandedConfig = {
      player: {
        ...config.player,
        deck: {
          ...config.player.deck,
          cards: expandDeck(config.player.deck.cards)
        }
      },
      ai: {
        ...config.ai,
        deck: {
          ...config.ai.deck,
          cards: expandDeck(config.ai.deck.cards)
        }
      },
      shop: config.shop
    };

    // Initialize game state
    const initialState = initializeGame(expandedConfig);

    setGameConfig(expandedConfig);
    setGameState(initialState);
    setGamePhase('playing');

    console.log('Game initialized:', initialState);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      {gamePhase === 'hero-select' && (
        <HeroSelection decks={decks} onStartGame={handleStartGame} />
      )}

      {gamePhase === 'playing' && gameState && (
        <GameBoard
          gameState={gameState}
          onStateChange={setGameState}
          onGameOver={() => setGamePhase('game-over')}
        />
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
