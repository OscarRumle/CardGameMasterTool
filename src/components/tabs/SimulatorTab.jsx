import { useState } from 'react';
import { Shuffle, RotateCcw, ChevronRight } from 'lucide-react';

const SimulatorTab = ({ decks }) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [mulliganCards, setMulliganCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

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
        // Game Screen
        <div className="fixed inset-0 bg-black pt-24 pb-8 px-8 overflow-hidden">
          {/* Header Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6 items-center">
              <h2 className="text-2xl font-bold text-amber-500">{selectedDeck.name}</h2>
              <div className="flex gap-4 text-lg">
                <span className="text-zinc-400">Turn: <span className="text-white font-bold">{gameState.turn}</span></span>
                <span className="text-zinc-400">Mana: <span className="text-blue-400 font-bold text-2xl">{gameState.mana}/{gameState.maxMana}</span></span>
              </div>
            </div>

            <div className="flex gap-4">
              {gameState.phase === 'playing' && (
                <button
                  onClick={nextTurn}
                  disabled={gameState.deck.length === 0}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-3 font-bold flex items-center gap-2 transition"
                >
                  NEXT TURN
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={resetGame}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 font-bold flex items-center gap-2 transition"
              >
                <RotateCcw className="w-5 h-5" />
                NEW GAME
              </button>
            </div>
          </div>

          {/* Deck and Discard Counters */}
          <div className="flex gap-4 mb-4">
            <div className="bg-zinc-900 border-2 border-zinc-800 px-4 py-2">
              <span className="text-zinc-400">Deck: </span>
              <span className="text-white font-bold">{gameState.deck.length}</span>
            </div>
            <div className="bg-zinc-900 border-2 border-zinc-800 px-4 py-2">
              <span className="text-zinc-400">Discard: </span>
              <span className="text-white font-bold">{gameState.discard.length}</span>
            </div>
          </div>

          {/* Mulligan Phase */}
          {gameState.phase === 'mulligan' && (
            <div className="bg-amber-900/20 border-2 border-amber-600 p-6 mb-4">
              <h3 className="text-xl font-bold text-amber-500 mb-2">MULLIGAN PHASE</h3>
              <p className="text-zinc-300 mb-4">Click up to 4 cards to replace them. Cards will be shuffled back and redrawn.</p>
              <button
                onClick={confirmMulligan}
                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 font-bold transition"
              >
                CONFIRM MULLIGAN ({mulliganCards.length} cards)
              </button>
            </div>
          )}

          {/* Board Zone */}
          <div className="mb-6">
            <h3 className="text-zinc-500 font-bold mb-2">BOARD</h3>
            <div className="bg-zinc-900/50 border-2 border-zinc-800 p-4 min-h-[180px] flex gap-3 flex-wrap">
              {gameState.board.length === 0 ? (
                <div className="flex items-center justify-center w-full text-zinc-600">
                  No minions on board
                </div>
              ) : (
                gameState.board.map(card => (
                  <MiniCard key={card.instanceId} card={card} zone="board" />
                ))
              )}
            </div>
          </div>

          {/* Hand Zone */}
          <div>
            <h3 className="text-zinc-500 font-bold mb-2">HAND ({gameState.hand.length})</h3>
            <div className="bg-zinc-900/50 border-2 border-amber-600 p-4 min-h-[200px] flex gap-3 flex-wrap">
              {gameState.hand.map(card => (
                <MiniCard
                  key={card.instanceId}
                  card={card}
                  zone="hand"
                  onClick={() => {
                    if (gameState.phase === 'mulligan') {
                      toggleMulligan(card.instanceId);
                    } else {
                      playCard(card);
                    }
                  }}
                  isSelected={mulliganCards.includes(card.instanceId)}
                  isShaking={selectedCard === card.instanceId}
                  canAfford={gameState.phase === 'playing' && gameState.mana >= (card['Mana Cost'] || 0)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini card component for hand/board display
const MiniCard = ({ card, zone, onClick, isSelected, isShaking, canAfford }) => {
  const isMinion = card['Card Type'] === 'Minion';
  const cost = card['Mana Cost'] || 0;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white border-2 rounded p-2 w-32 cursor-pointer transition-all select-none
        ${zone === 'hand' && !isSelected && canAfford !== false ? 'hover:scale-105 hover:border-amber-500' : ''}
        ${zone === 'hand' && !canAfford ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSelected ? 'border-amber-500 bg-amber-100' : 'border-zinc-800'}
        ${isShaking ? 'animate-shake' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-xs text-black leading-tight flex-1">{card['Card Name']}</div>
        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ml-1">
          {cost}
        </div>
      </div>

      <div className="text-[8px] text-zinc-600 mb-2">{card['Card Type']}</div>

      <div className="text-[9px] text-black line-clamp-3 mb-2">{card.Effect || ''}</div>

      {isMinion && (
        <div className="flex justify-between text-xs font-bold text-black">
          <span>⚔️ {card.Attack}</span>
          <span>❤️ {card.Health}</span>
        </div>
      )}
    </div>
  );
};

export default SimulatorTab;
