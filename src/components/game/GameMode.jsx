import { useState } from 'react';
import HeroSelection from './HeroSelection';
import GameBoard from './GameBoard';
import { initializeGame, expandDeck } from '../../utils/gameEngine';

function GameMode({ decks }) {
  const [gamePhase, setGamePhase] = useState('hero-select'); // 'hero-select', 'playing', 'game-over'
  const [gameConfig, setGameConfig] = useState(null);
  const [gameState, setGameState] = useState(null);

  const handleStartGame = (config) => {
    console.log('handleStartGame called with config:', config);

    try {
      // Expand decks based on Copies field
      console.log('Expanding player deck...');
      const expandedPlayerCards = expandDeck(config.player.deck.cards);
      console.log('Player deck expanded:', expandedPlayerCards.length, 'cards');

      console.log('Expanding AI deck...');
      const expandedAiCards = expandDeck(config.ai.deck.cards);
      console.log('AI deck expanded:', expandedAiCards.length, 'cards');

      const expandedConfig = {
        player: {
          ...config.player,
          deck: {
            ...config.player.deck,
            cards: expandedPlayerCards
          }
        },
        ai: {
          ...config.ai,
          deck: {
            ...config.ai.deck,
            cards: expandedAiCards
          }
        },
        shop: config.shop
      };

      console.log('Initializing game state...');
      // Initialize game state
      const initialState = initializeGame(expandedConfig);
      console.log('Game initialized successfully:', initialState);

      setGameConfig(expandedConfig);
      setGameState(initialState);
      setGamePhase('playing');

      console.log('Game phase set to playing');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game: ' + error.message);
    }
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

      {gamePhase === 'game-over' && gameState && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">
              {gameState.winner === 'player' ? (
                <span className="text-green-400">🎉 VICTORY! 🎉</span>
              ) : (
                <span className="text-red-400">💀 DEFEAT 💀</span>
              )}
            </h1>

            <p className="text-2xl text-zinc-400 mb-8">
              {gameState.winner === 'player' ? 'You have defeated the AI!' : 'The AI has defeated you!'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setGamePhase('hero-select');
                  setGameState(null);
                  setGameConfig(null);
                }}
                className="px-8 py-4 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition"
              >
                PLAY AGAIN
              </button>
            </div>

            {/* Final Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-green-900/20 border-2 border-green-700 rounded-lg p-6">
                <h3 className="text-green-400 font-bold text-xl mb-4">YOUR STATS</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Hero:</span>
                    <span className="text-white">{gameState.player.hero.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Final Health:</span>
                    <span className="text-white">{gameState.player.hero.currentHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cards Left:</span>
                    <span className="text-white">{gameState.player.zones.deck.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-900/20 border-2 border-red-800 rounded-lg p-6">
                <h3 className="text-red-400 font-bold text-xl mb-4">AI STATS</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Hero:</span>
                    <span className="text-white">{gameState.ai.hero.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Final Health:</span>
                    <span className="text-white">{gameState.ai.hero.currentHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cards Left:</span>
                    <span className="text-white">{gameState.ai.zones.deck.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameMode;
