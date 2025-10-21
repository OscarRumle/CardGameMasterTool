import { Plus, FileText, Trash2 } from 'lucide-react';

const MyDecksTab = ({ decks, onCreateDeck, onViewDeck, onExportDeck, onDeleteDeck }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-amber-500 tracking-wider">MY DECKS</h1>
        <button
          onClick={onCreateDeck}
          className="bg-zinc-900 border-2 border-amber-600 hover:bg-amber-600 text-white px-6 py-3 flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold tracking-wide">NEW DECK</span>
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="bg-zinc-900 border-2 border-zinc-800 p-12 text-center">
          <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg">No decks yet. Create your first deck to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <div key={deck.id} className="bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 p-6 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{deck.name}</h3>
                  <span className={`text-xs px-2 py-1 border ${
                    deck.type === 'hero'
                      ? 'border-green-600 text-green-400'
                      : 'border-amber-600 text-amber-400'
                  } tracking-wider`}>
                    {deck.type === 'hero' ? 'HERO DECK' : 'EQUIPMENT DECK'}
                  </span>
                </div>
                <button onClick={() => onDeleteDeck(deck.id)} className="text-red-500 hover:text-red-400 transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="text-zinc-500 text-sm mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{deck.cards.length} cards</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewDeck(deck)}
                  className="flex-1 bg-zinc-950 border border-zinc-700 hover:border-amber-600 text-white px-4 py-2 transition text-sm font-bold tracking-wide"
                >
                  VIEW
                </button>
                <button
                  onClick={() => onExportDeck(deck)}
                  className="flex-1 bg-zinc-950 border border-zinc-700 hover:border-green-600 text-white px-4 py-2 transition text-sm font-bold tracking-wide"
                >
                  EXPORT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDecksTab;
