import { useState, useEffect, useMemo } from 'react';
import { simulateGoldGain } from '../../utils/goldSimulator';
import GoldGraph from './GoldGraph';
import AffordableItemsList from './AffordableItemsList';

const EconomySimulation = ({ decks, balanceDeck1, balanceDeck2, setBalanceDeck1, setBalanceDeck2 }) => {
  // Equipment deck selection
  const [equipmentDeck, setEquipmentDeck] = useState(null);

  // Simulation parameters
  const [passiveGold, setPassiveGold] = useState(1);
  const [minionDeathRate, setMinionDeathRate] = useState(0.75);
  const [maxRounds, setMaxRounds] = useState(12);

  // Load from localStorage
  useEffect(() => {
    const savedEquipmentDeckId = localStorage.getItem('economyEquipmentDeck');
    const savedPassiveGold = localStorage.getItem('economyPassiveGold');
    const savedMinionDeathRate = localStorage.getItem('economyMinionDeathRate');
    const savedMaxRounds = localStorage.getItem('economyMaxRounds');

    if (savedEquipmentDeckId) {
      const deck = decks.find(d => d.id === parseInt(savedEquipmentDeckId));
      if (deck) setEquipmentDeck(deck);
    }

    if (savedPassiveGold) setPassiveGold(parseFloat(savedPassiveGold));
    if (savedMinionDeathRate) setMinionDeathRate(parseFloat(savedMinionDeathRate));
    if (savedMaxRounds) setMaxRounds(parseInt(savedMaxRounds));
  }, [decks]);

  // Save to localStorage
  useEffect(() => {
    if (equipmentDeck) {
      localStorage.setItem('economyEquipmentDeck', equipmentDeck.id.toString());
    } else {
      localStorage.removeItem('economyEquipmentDeck');
    }
  }, [equipmentDeck]);

  useEffect(() => {
    localStorage.setItem('economyPassiveGold', passiveGold.toString());
  }, [passiveGold]);

  useEffect(() => {
    localStorage.setItem('economyMinionDeathRate', minionDeathRate.toString());
  }, [minionDeathRate]);

  useEffect(() => {
    localStorage.setItem('economyMaxRounds', maxRounds.toString());
  }, [maxRounds]);

  // Memoized simulations
  const deck1Simulation = useMemo(() => {
    if (!balanceDeck1 || !balanceDeck2) return null;
    return simulateGoldGain(balanceDeck1, balanceDeck2, equipmentDeck, {
      maxRounds,
      passiveGoldPerRound: passiveGold,
      minionDeathRate
    });
  }, [balanceDeck1, balanceDeck2, equipmentDeck, maxRounds, passiveGold, minionDeathRate]);

  const deck2Simulation = useMemo(() => {
    if (!balanceDeck1 || !balanceDeck2) return null;
    return simulateGoldGain(balanceDeck2, balanceDeck1, equipmentDeck, {
      maxRounds,
      passiveGoldPerRound: passiveGold,
      minionDeathRate
    });
  }, [balanceDeck1, balanceDeck2, equipmentDeck, maxRounds, passiveGold, minionDeathRate]);

  const equipmentDecks = decks.filter(d => d.type === 'equipment');

  // Error messages
  const showDeckWarning = !balanceDeck1 || !balanceDeck2;
  const showEquipmentWarning = !equipmentDeck;

  return (
    <div>
      {/* Parameter Dashboard */}
      <div className="mb-6 p-6 bg-zinc-900 border-2 border-zinc-800">
        <h2 className="text-xl font-bold text-amber-500 mb-4 tracking-wide">SIMULATION PARAMETERS</h2>

        <div className="grid grid-cols-3 gap-6">
          {/* Passive Gold */}
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              Passive Gold Per Round
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={passiveGold}
              onChange={(e) => setPassiveGold(parseFloat(e.target.value) || 0)}
              className="w-full bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">Gold gained passively each round</p>
          </div>

          {/* Minion Death Rate */}
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              Minion Death Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={minionDeathRate * 100}
              onChange={(e) => setMinionDeathRate((parseFloat(e.target.value) || 0) / 100)}
              className="w-full bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">Chance minions die (75% default)</p>
          </div>

          {/* Max Rounds */}
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              Max Rounds
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={maxRounds}
              onChange={(e) => setMaxRounds(parseInt(e.target.value) || 1)}
              className="w-full bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">Rounds to simulate (12 default)</p>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {showDeckWarning && (
        <div className="mb-6 p-6 bg-zinc-900 border-2 border-yellow-600">
          <p className="text-yellow-500 font-bold">
            Please select both Deck A and Deck B in the General tab to see economy simulation.
          </p>
        </div>
      )}

      {/* Main Layout: 3 columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Hero A (Deck 1) */}
        <div className="border-2 border-green-600 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold text-green-500 mb-4 tracking-wide">DECK A</h2>

          {/* Deck Selector */}
          <select
            value={balanceDeck1?.id || ''}
            onChange={(e) => {
              const deck = decks.find(d => d.id === parseInt(e.target.value));
              setBalanceDeck1(deck || null);
            }}
            className="w-full bg-black text-white px-4 py-3 mb-4 border-2 border-zinc-800 focus:border-green-600 focus:outline-none"
          >
            <option value="">Select a deck...</option>
            {decks.filter(d => d.type === 'hero').map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>

          {balanceDeck1 && deck1Simulation && (
            <>
              <GoldGraph data={deck1Simulation} color="green" />
              <AffordableItemsList simulation={deck1Simulation} color="green" />
            </>
          )}
        </div>

        {/* CENTER: Equipment Deck Selector */}
        <div className="border-2 border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold text-amber-500 mb-4 tracking-wide">EQUIPMENT DECK</h2>

          <select
            value={equipmentDeck?.id || ''}
            onChange={(e) => {
              const deck = decks.find(d => d.id === parseInt(e.target.value));
              setEquipmentDeck(deck || null);
            }}
            className="w-full bg-black text-white px-4 py-3 mb-4 border-2 border-zinc-800 focus:border-amber-500 focus:outline-none"
          >
            <option value="">Select equipment deck...</option>
            {equipmentDecks.map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>

          {showEquipmentWarning && !showDeckWarning && (
            <div className="mt-4 p-4 bg-black border-2 border-zinc-800">
              <p className="text-zinc-400 text-sm">
                Select an equipment deck to see which items heroes can afford.
              </p>
            </div>
          )}

          {equipmentDeck && (
            <div className="mt-4 p-4 bg-black border-2 border-zinc-800">
              <h3 className="text-sm font-bold text-amber-500 mb-2">TIER AVAILABILITY</h3>
              <div className="text-xs text-zinc-400 space-y-1">
                <p><span className="text-amber-400">Tier 1:</span> Rounds 1-4</p>
                <p><span className="text-amber-400">Tier 2:</span> Rounds 5-8</p>
                <p><span className="text-amber-400">Tier 3:</span> Rounds 9+</p>
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                Old tiers become unavailable when new tier unlocks.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Hero B (Deck 2) */}
        <div className="border-2 border-blue-600 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold text-blue-500 mb-4 tracking-wide">DECK B</h2>

          {/* Deck Selector */}
          <select
            value={balanceDeck2?.id || ''}
            onChange={(e) => {
              const deck = decks.find(d => d.id === parseInt(e.target.value));
              setBalanceDeck2(deck || null);
            }}
            className="w-full bg-black text-white px-4 py-3 mb-4 border-2 border-zinc-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Select a deck...</option>
            {decks.filter(d => d.type === 'hero' && d.id !== balanceDeck1?.id).map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>

          {balanceDeck2 && deck2Simulation && (
            <>
              <GoldGraph data={deck2Simulation} color="blue" />
              <AffordableItemsList simulation={deck2Simulation} color="blue" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EconomySimulation;
