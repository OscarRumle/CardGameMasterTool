import DecklistDisplay from '../balancing/DecklistDisplay';
import DeckAnalysisPanel from '../balancing/DeckAnalysisPanel';

const BalancingTab = ({ decks, balanceDeck1, balanceDeck2, setBalanceDeck1, setBalanceDeck2, deck1Analysis, deck2Analysis }) => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-amber-500 mb-8 tracking-wider">BALANCING OVERVIEW</h1>

      <div className="grid grid-cols-2 gap-0 border-2 border-zinc-800">
        {/* DECK A */}
        <div className="border-r-2 border-zinc-800 p-6 bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-green-500 mb-4 tracking-wide">DECK A</h2>
            <select
              value={balanceDeck1?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setBalanceDeck1(deck || null);
              }}
              className="w-full bg-black text-white px-4 py-3 border-2 border-zinc-800 focus:border-green-600 focus:outline-none"
            >
              <option value="">Select a deck...</option>
              {decks.filter(d => d.type === 'hero').map(deck => (
                <option key={deck.id} value={deck.id}>{deck.name}</option>
              ))}
            </select>
          </div>

          {balanceDeck1 && <DecklistDisplay cards={balanceDeck1.cards} color="green" />}
          <DeckAnalysisPanel deck={balanceDeck1} analysis={deck1Analysis} color="green" />
        </div>

        {/* DECK B */}
        <div className="p-6 bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-500 mb-4 tracking-wide">DECK B</h2>
            <select
              value={balanceDeck2?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === parseInt(e.target.value));
                setBalanceDeck2(deck || null);
              }}
              className="w-full bg-black text-white px-4 py-3 border-2 border-zinc-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select a deck...</option>
              {decks.filter(d => d.type === 'hero' && d.id !== balanceDeck1?.id).map(deck => (
                <option key={deck.id} value={deck.id}>{deck.name}</option>
              ))}
            </select>
          </div>

          {balanceDeck2 && <DecklistDisplay cards={balanceDeck2.cards} color="blue" />}
          <DeckAnalysisPanel deck={balanceDeck2} analysis={deck2Analysis} color="blue" />
        </div>
      </div>
    </div>
  );
};

export default BalancingTab;
