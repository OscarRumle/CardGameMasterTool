import { useState } from 'react';

const HEROES = [
  {
    id: 'necromancer',
    name: 'Necromancer',
    subtitle: 'Master of Death',
    description: 'Raise fallen minions and sacrifice for power',
    mechanics: ['Raise', 'Sacrifice', 'Graveyard Synergy'],
    color: 'from-purple-600 to-indigo-900'
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    subtitle: 'Fury Warrior',
    description: 'Build fury and unleash devastating attacks',
    mechanics: ['Fury', 'Weapon Attacks', 'Burst Damage'],
    color: 'from-red-600 to-orange-900',
    disabled: true
  },
  {
    id: 'mage',
    name: 'Mage',
    subtitle: 'Arcane Master',
    description: 'Build arcana and control the battlefield',
    mechanics: ['Arcana', 'Echo Zone', 'Spell Synergy'],
    color: 'from-blue-600 to-cyan-900',
    disabled: true
  },
  {
    id: 'rogue',
    name: 'Rogue',
    subtitle: 'Shadow Assassin',
    description: 'Strike from stealth and spend gold for power',
    mechanics: ['Stealth', 'Gold Economy', 'Burst Combos'],
    color: 'from-gray-600 to-slate-900',
    disabled: true
  }
];

function HeroSelection({ decks, onStartGame }) {
  const [selectedHero, setSelectedHero] = useState('necromancer');
  const [playerDeck, setPlayerDeck] = useState(null);
  const [aiHero, setAiHero] = useState('necromancer');
  const [aiDeck, setAiDeck] = useState(null);
  const [shopDeck, setShopDeck] = useState(null);

  console.log('HeroSelection rendered with', decks.length, 'decks');

  const canStart = playerDeck && aiDeck && shopDeck;

  const handleStartGame = () => {
    console.log('Start Game clicked!');
    console.log('canStart:', canStart);
    console.log('playerDeck:', playerDeck);
    console.log('aiDeck:', aiDeck);
    console.log('shopDeck:', shopDeck);

    if (canStart) {
      console.log('Starting game with config...');
      onStartGame({
        player: {
          hero: selectedHero,
          deck: playerDeck
        },
        ai: {
          hero: aiHero,
          deck: aiDeck
        },
        shop: shopDeck
      });
    } else {
      console.log('Cannot start - missing decks');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-5xl font-bold text-amber-500 text-center mb-4">
        SELECT YOUR HERO
      </h1>
      <p className="text-zinc-400 text-center mb-12">
        Choose your champion and prepare for battle
      </p>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {HEROES.map((hero) => (
          <button
            key={hero.id}
            onClick={() => !hero.disabled && setSelectedHero(hero.id)}
            disabled={hero.disabled}
            className={`relative p-6 rounded-xl bg-gradient-to-br ${hero.color}
              ${selectedHero === hero.id ? 'ring-4 ring-amber-500 scale-105' : 'ring-2 ring-zinc-700'}
              ${hero.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              transition-all duration-200 text-left`}
          >
            {hero.disabled && (
              <div className="absolute top-4 right-4 bg-zinc-900 text-zinc-400 text-xs px-3 py-1 rounded-full font-bold">
                COMING SOON
              </div>
            )}

            <h3 className="text-2xl font-bold text-white mb-1">{hero.name}</h3>
            <p className="text-zinc-300 text-sm mb-3">{hero.subtitle}</p>
            <p className="text-zinc-200 text-sm mb-4">{hero.description}</p>

            <div className="space-y-1">
              {hero.mechanics.map((mechanic) => (
                <div key={mechanic} className="text-xs bg-black/30 px-2 py-1 rounded text-amber-400 inline-block mr-2">
                  {mechanic}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Deck Selection */}
      <div className="bg-zinc-900 rounded-xl p-8 border-2 border-zinc-800">
        <h2 className="text-2xl font-bold text-amber-500 mb-6">GAME SETUP</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Deck */}
          <div>
            <label className="block text-zinc-400 text-sm font-bold mb-2">
              YOUR DECK (Necromancer)
            </label>
            <select
              value={playerDeck?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setPlayerDeck(deck);
              }}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border-2 border-zinc-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select Deck --</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck.cards.length} cards)
                </option>
              ))}
            </select>
          </div>

          {/* AI Deck */}
          <div>
            <label className="block text-zinc-400 text-sm font-bold mb-2">
              OPPONENT DECK (AI)
            </label>
            <select
              value={aiDeck?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setAiDeck(deck);
              }}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border-2 border-zinc-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select Deck --</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck.cards.length} cards)
                </option>
              ))}
            </select>
          </div>

          {/* Shop Deck */}
          <div>
            <label className="block text-zinc-400 text-sm font-bold mb-2">
              SHOP / EQUIPMENT DECK
            </label>
            <select
              value={shopDeck?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setShopDeck(deck);
              }}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border-2 border-zinc-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select Deck --</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck.cards.length} cards)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`px-12 py-4 text-xl font-bold rounded-lg transition-all duration-200
              ${canStart
                ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 shadow-lg shadow-amber-500/50'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
          >
            {canStart ? 'START GAME' : 'SELECT ALL DECKS TO START'}
          </button>
        </div>

        {/* Info */}
        {decks.length === 0 && (
          <div className="mt-6 p-4 bg-red-900/20 border-2 border-red-800 rounded-lg">
            <p className="text-red-400 text-center">
              No decks found! Please go back to Tool Mode and upload some decks first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSelection;
