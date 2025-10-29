import { useState } from 'react';
import { Shuffle, RotateCcw, ChevronRight } from 'lucide-react';
import ClassCard from '../cards/ClassCard';

const SimulatorTab = ({ decks, textSettings, keywords }) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [mulliganCards, setMulliganCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start a new game
  const startGame = () => {
    if (!selectedDeck) return;

    // Create 40 card deck (respecting Copies field)
    const fullDeck = [];
    selectedDeck.cards.forEach(card => {
      const copies = card.Copies || 1;
      for (let i = 0; i < copies; i++) {
        fullDeck.push({ ...card, instanceId: `${card.id}-${i}` });
      }
    });

    // Shuffle and draw 4 cards
    const shuffledDeck = shuffleArray(fullDeck);
    const hand = shuffledDeck.slice(0, 4);
    const deck = shuffledDeck.slice(4);

    setGameState({
      deck,
      hand,
      board: [],
      discard: [],
      mana: 1,
      maxMana: 1,
      turn: 1,
      phase: 'mulligan' // mulligan, playing
    });
    setMulliganCards([]);
  };

  // Toggle card for mulligan
  const toggleMulligan = (instanceId) => {
    if (mulliganCards.includes(instanceId)) {
      setMulliganCards(mulliganCards.filter(id => id !== instanceId));
    } else {
      if (mulliganCards.length < 4) {
        setMulliganCards([...mulliganCards, instanceId]);
      }
    }
  };

  // Confirm mulligan
  const confirmMulligan = () => {
    if (mulliganCards.length === 0) {
      // Skip mulligan
      setGameState({ ...gameState, phase: 'playing' });
      return;
    }

    // Remove mulligan cards from hand
    const newHand = gameState.hand.filter(card => !mulliganCards.includes(card.instanceId));

    // Put mulligan cards back in deck
    const cardsToShuffle = gameState.hand.filter(card => mulliganCards.includes(card.instanceId));
    const newDeck = shuffleArray([...gameState.deck, ...cardsToShuffle]);

    // Draw replacement cards
    const replacementCards = newDeck.slice(0, mulliganCards.length);
    const finalDeck = newDeck.slice(mulliganCards.length);

    setGameState({
      ...gameState,
      hand: [...newHand, ...replacementCards],
      deck: finalDeck,
      phase: 'playing'
    });
    setMulliganCards([]);
  };

  // Next turn
  const nextTurn = () => {
    if (gameState.deck.length === 0) return;

    const drawnCard = gameState.deck[0];
    const newDeck = gameState.deck.slice(1);
    const newMaxMana = Math.min(gameState.maxMana + 1, 10);

    setGameState({
      ...gameState,
      hand: [...gameState.hand, drawnCard],
      deck: newDeck,
      mana: newMaxMana,
      maxMana: newMaxMana,
      turn: gameState.turn + 1
    });
  };

  // Play a card
  const playCard = (card) => {
    const cost = card['Mana Cost'] || 0;

    if (gameState.mana < cost) {
      // Not enough mana - visual feedback
      setSelectedCard(card.instanceId);
      setTimeout(() => setSelectedCard(null), 300);
      return;
    }

    const newHand = gameState.hand.filter(c => c.instanceId !== card.instanceId);
    const isMinion = card['Card Type'] === 'Minion';

    if (isMinion) {
      // Add to board
      setGameState({
        ...gameState,
        hand: newHand,
        board: [...gameState.board, card],
        mana: gameState.mana - cost
      });
    } else {
      // Spell/other - goes to discard
      setGameState({
        ...gameState,
        hand: newHand,
        discard: [...gameState.discard, card],
        mana: gameState.mana - cost
      });
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState(null);
    setMulliganCards([]);
    setSelectedCard(null);
  };

  return (
    <div className="select-none">
      <h1 className="text-4xl font-bold text-amber-500 mb-8 tracking-wider">GAME SIMULATOR</h1>

      {!gameState ? (
        // Deck Selection Screen
        <div className="max-w-2xl">
          <p className="text-zinc-400 mb-6">
            Select a deck and simulate the draw/play experience. Test how your deck curves and feels in gameplay.
          </p>

          <div className="mb-6">
            <label className="block text-zinc-400 mb-2 font-bold">SELECT DECK</label>
            <select
              value={selectedDeck?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setSelectedDeck(deck || null);
              }}
              className="w-full bg-black text-white px-4 py-3 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
            >
              <option value="">Choose a deck...</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>{deck.name} ({deck.type})</option>
              ))}
            </select>
          </div>

          <button
            onClick={startGame}
            disabled={!selectedDeck}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-4 font-bold flex items-center gap-2 transition"
          >
            <Shuffle className="w-5 h-5" />
            START GAME
          </button>
        </div>
      ) : (
        // Game Screen - MTG Arena Style
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden select-none" style={{ width: '1920px', height: '1080px', margin: '0 auto' }}>
          {/* Top Bar - Opponent Area */}
          <div className="h-16 bg-black/40 border-b border-zinc-700 px-6 flex items-center justify-between">
            <div className="flex gap-6 items-center">
              <h2 className="text-xl font-bold text-amber-500">{selectedDeck.name}</h2>
              <div className="bg-zinc-900/80 px-4 py-2 border border-zinc-700 rounded">
                <span className="text-zinc-400 text-sm">Deck: </span>
                <span className="text-white font-bold">{gameState.deck.length}</span>
              </div>
              <div className="bg-zinc-900/80 px-4 py-2 border border-zinc-700 rounded">
                <span className="text-zinc-400 text-sm">Discard: </span>
                <span className="text-white font-bold">{gameState.discard.length}</span>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex gap-4 text-lg">
                <span className="text-zinc-400">Turn <span className="text-white font-bold">{gameState.turn}</span></span>
                <div className="flex gap-1 items-center">
                  <span className="text-4xl">◆</span>
                  <span className="text-blue-400 font-bold text-3xl">{gameState.mana}</span>
                  <span className="text-zinc-500 text-xl">/ {gameState.maxMana}</span>
                </div>
              </div>

              {gameState.phase === 'playing' && (
                <button
                  onClick={nextTurn}
                  disabled={gameState.deck.length === 0}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-3 font-bold flex items-center gap-2 transition rounded"
                >
                  NEXT TURN
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={resetGame}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 font-bold flex items-center gap-2 transition rounded"
              >
                <RotateCcw className="w-4 h-4" />
                EXIT
              </button>
            </div>
          </div>

          {/* Mulligan Banner */}
          {gameState.phase === 'mulligan' && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600 border-2 border-amber-400 px-8 py-4 rounded shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2 text-center">MULLIGAN PHASE</h3>
              <p className="text-amber-100 mb-3 text-center">Click cards to replace them (up to 4)</p>
              <button
                onClick={confirmMulligan}
                className="w-full bg-white hover:bg-amber-100 text-amber-900 px-6 py-3 font-bold transition rounded"
              >
                KEEP HAND ({mulliganCards.length} selected)
              </button>
            </div>
          )}

          {/* Main Playfield - Board Area */}
          <div className="h-[calc(1080px-16*4-250px)] flex items-center justify-center px-8">
            {gameState.board.length === 0 ? (
              <div className="text-zinc-600 text-xl font-bold">
                Play minions from your hand
              </div>
            ) : (
              <div className="flex gap-4 flex-wrap justify-center max-w-[1400px]">
                {gameState.board.map(card => (
                  <div
                    key={card.instanceId}
                    className="transform scale-90 hover:scale-100 transition-transform"
                    style={{ transformOrigin: 'center' }}
                  >
                    <ClassCard
                      card={card}
                      customization={selectedDeck.customization}
                      textSettings={textSettings || {}}
                      keywords={keywords || []}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hand Zone - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-t from-black/60 to-transparent border-t border-zinc-700/50 flex items-end justify-center pb-4">
            <div className="flex gap-2 justify-center" style={{ perspective: '1000px' }}>
              {gameState.hand.map((card, index) => (
                <HandCard
                  key={card.instanceId}
                  card={card}
                  index={index}
                  totalCards={gameState.hand.length}
                  onClick={() => {
                    if (gameState.phase === 'mulligan') {
                      toggleMulligan(card.instanceId);
                    } else {
                      playCard(card);
                    }
                  }}
                  onHover={(isHovering) => {
                    setHoveredCard(isHovering ? card : null);
                  }}
                  isSelected={mulliganCards.includes(card.instanceId)}
                  isShaking={selectedCard === card.instanceId}
                  canAfford={gameState.phase === 'playing' && gameState.mana >= (card['Mana Cost'] || 0)}
                  customization={selectedDeck.customization}
                  textSettings={textSettings || {}}
                  keywords={keywords || []}
                />
              ))}
            </div>
          </div>

          {/* Hovered Card Preview - Large */}
          {hoveredCard && (
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none scale-150">
              <ClassCard
                card={hoveredCard}
                customization={selectedDeck.customization}
                textSettings={textSettings || {}}
                keywords={keywords || []}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hand card component with hover effect
const HandCard = ({ card, onClick, onHover, isSelected, isShaking, canAfford, customization, textSettings, keywords }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`
        relative cursor-pointer transition-all duration-200 transform
        ${!isSelected && canAfford !== false ? 'hover:-translate-y-8' : ''}
        ${!canAfford ? 'opacity-40 cursor-not-allowed grayscale' : ''}
        ${isSelected ? 'border-4 border-amber-500 rounded-lg' : ''}
        ${isShaking ? 'animate-shake' : ''}
      `}
      style={{
        transform: `scale(0.7)`,
        transformOrigin: 'bottom center'
      }}
    >
      <ClassCard
        card={card}
        customization={customization}
        textSettings={textSettings}
        keywords={keywords}
      />
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
          ✓
        </div>
      )}
    </div>
  );
};

export default SimulatorTab;
