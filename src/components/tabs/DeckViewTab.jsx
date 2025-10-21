import { Palette, Printer } from 'lucide-react';
import MTGCard from '../cards/MTGCard';

const DeckViewTab = ({ deck, textSettings, keywords, onBack, onCustomize, onExport }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-amber-500 hover:text-amber-400 mb-2 flex items-center gap-2 font-bold tracking-wide"
          >
            ← BACK TO DECKS
          </button>
          <h1 className="text-4xl font-bold text-white tracking-wide">{deck.name}</h1>
          <p className="text-zinc-500 mt-2">{deck.cards.length} cards</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCustomize}
            className="bg-zinc-900 border-2 border-purple-600 hover:bg-purple-600 text-white px-4 py-2 flex items-center gap-2 transition"
          >
            <Palette className="w-4 h-4" />
            <span className="font-bold tracking-wide">CUSTOMIZE</span>
          </button>
          <button
            onClick={onExport}
            className="bg-zinc-900 border-2 border-green-600 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span className="font-bold tracking-wide">EXPORT</span>
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 63mm)',
        gap: '5mm',
        justifyContent: 'center'
      }}>
        {deck.cards.map((card) => (
          <div key={card.id}>
            <MTGCard card={card} customization={deck.customization} textSettings={textSettings} keywords={keywords} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckViewTab;
