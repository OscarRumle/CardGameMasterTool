import { Plus, Eye } from 'lucide-react';

const HomeTab = ({ onCreateDeck, onViewDecks, deckCount }) => {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-500 mb-4">HELLO</h1>
        <h1 className="text-6xl font-bold text-amber-500 mb-4 tracking-wider">CARD GENERATOR</h1>
        <p className="text-xl text-zinc-400 tracking-wide">CREATE • CUSTOMIZE • CONQUER</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={onCreateDeck}
          className="bg-zinc-900 border-2 border-zinc-800 hover:border-amber-600 text-white p-8 flex flex-col items-center gap-4 transition group"
        >
          <Plus className="w-16 h-16 text-amber-500 group-hover:text-amber-400" />
          <h2 className="text-2xl font-bold tracking-wide">CREATE NEW DECK</h2>
          <p className="text-zinc-400">Upload CSV and start building</p>
        </button>

        <button
          onClick={onViewDecks}
          className="bg-zinc-900 border-2 border-zinc-800 hover:border-red-600 text-white p-8 flex flex-col items-center gap-4 transition group"
        >
          <Eye className="w-16 h-16 text-red-500 group-hover:text-red-400" />
          <h2 className="text-2xl font-bold tracking-wide">VIEW MY DECKS</h2>
          <p className="text-zinc-400">{deckCount} deck{deckCount !== 1 ? 's' : ''} saved</p>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
