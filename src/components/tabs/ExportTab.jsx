import { Download, Printer } from 'lucide-react';
import A4PrintLayout from '../export/A4PrintLayout';

const ExportTab = ({ deck, filteredCards, textSettings, keywords, exportFilter, setExportFilter, easyPrintMode, setEasyPrintMode, onBack, onDownload }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-amber-500 hover:text-amber-400 mb-2 flex items-center gap-2 font-bold tracking-wide"
          >
            ← BACK TO DECK
          </button>
          <h1 className="text-4xl font-bold text-white tracking-wide">EXPORT: {deck.name}</h1>
          <p className="text-zinc-500 mt-2">
            {filteredCards.length === deck.cards.length
              ? `${deck.cards.length} cards • ${Math.ceil(deck.cards.length / 9)} page${Math.ceil(deck.cards.length / 9) !== 1 ? 's' : ''}`
              : `Showing ${filteredCards.length} of ${deck.cards.length} cards • ${Math.ceil(filteredCards.length / 9)} page${Math.ceil(filteredCards.length / 9) !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            className="bg-zinc-900 border-2 border-green-600 hover:bg-green-600 text-white px-6 py-3 flex items-center gap-2 transition"
          >
            <Download className="w-5 h-5" />
            <span className="font-bold tracking-wide">DOWNLOAD PRINTABLE</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-zinc-900 border-2 border-amber-600 hover:bg-amber-600 text-white px-6 py-3 flex items-center gap-2 transition"
          >
            <Printer className="w-5 h-5" />
            <span className="font-bold tracking-wide">PRINT NOW</span>
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-bold text-zinc-400 tracking-wide">FILTER BY STATE</h3>

          {/* Easy Print Toggle */}
          <button
            onClick={() => setEasyPrintMode(!easyPrintMode)}
            className={`px-4 py-2 font-bold tracking-wide transition flex items-center gap-2 ${
              easyPrintMode
                ? 'bg-purple-900/50 border-2 border-purple-600 text-purple-400'
                : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:border-purple-700'
            }`}
          >
            <span className="text-lg">✂️</span>
            <span>EASY PRINT {easyPrintMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setExportFilter('all')}
            className={`px-6 py-3 font-bold tracking-wide transition ${
              exportFilter === 'all'
                ? 'bg-zinc-800 border-2 border-zinc-600 text-white'
                : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            ALL CARDS
          </button>
          <button
            onClick={() => setExportFilter('print-new')}
            className={`px-6 py-3 font-bold tracking-wide transition ${
              exportFilter === 'print-new'
                ? 'bg-amber-900/50 border-2 border-amber-600 text-amber-400'
                : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:border-amber-700'
            }`}
          >
            🖨️ PRINT NEW
          </button>
          <button
            onClick={() => setExportFilter('updated')}
            className={`px-6 py-3 font-bold tracking-wide transition ${
              exportFilter === 'updated'
                ? 'bg-green-900/50 border-2 border-green-600 text-green-400'
                : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:border-green-700'
            }`}
          >
            ✓ UPDATED
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border-2 border-zinc-800 p-4 mb-6">
        <div className="mb-3">
          <p className="text-zinc-400 text-sm">
            <strong className="text-green-500">✅ RECOMMENDED:</strong> Click <strong>"DOWNLOAD PRINTABLE"</strong> to save an HTML file.
            Open it in your browser, then press Ctrl+P (Cmd+P on Mac) and select "Save as PDF". This works everywhere.
          </p>
        </div>
        <div>
          <p className="text-zinc-400 text-sm">
            <strong className="text-amber-500">⚡ ALTERNATIVE:</strong> Click <strong>"PRINT NOW"</strong> to try direct printing (may not work in all browsers).
          </p>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="bg-zinc-900 border-2 border-green-600 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-500 mb-2 tracking-wider">ALL CAUGHT UP!</h2>
          <p className="text-zinc-400 text-lg">
            {exportFilter === 'print-new'
              ? "No cards need printing. Everything's up to date!"
              : "No cards match this filter."}
          </p>
        </div>
      ) : (
        <>
          {easyPrintMode && (
            <div className="bg-purple-900/30 border-2 border-purple-600 p-4 mb-6">
              <p className="text-purple-400 text-sm">
                <strong className="text-purple-300">✂️ EASY PRINT MODE:</strong> Cards are tightly packed with no spacing.
                Cut straight down the columns and across the rows for fast batch cutting.
              </p>
            </div>
          )}

          <div data-export-content>
            <A4PrintLayout
              deck={{...deck, cards: filteredCards}}
              textSettings={textSettings}
              keywords={keywords}
              easyPrintMode={easyPrintMode}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ExportTab;
