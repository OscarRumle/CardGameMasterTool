import { Upload } from 'lucide-react';

const CreateDeckModal = ({ newDeckName, setNewDeckName, newDeckType, setNewDeckType, uploadedCards, onFileUpload, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-zinc-800 p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-amber-500 mb-6 tracking-wider">CREATE NEW DECK</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-zinc-400 mb-2 font-bold tracking-wide">DECK NAME</label>
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="e.g., Barbarian Starter"
              className="w-full bg-black text-white px-4 py-3 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-2 font-bold tracking-wide">DECK TYPE</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['hero', '⚔️', 'HERO DECK', '40-card class deck'],
                ['equipment', '🛡️', 'EQUIPMENT DECK', '45-item shop deck']
              ].map(([type, emoji, title, desc]) => (
                <button
                  key={type}
                  onClick={() => setNewDeckType(type)}
                  className={`p-4 border-2 transition ${
                    newDeckType === type
                      ? 'border-amber-600 bg-zinc-950 text-white'
                      : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <div className="font-bold tracking-wide">{title}</div>
                  <div className="text-sm opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-2 font-bold tracking-wide">UPLOAD CSV</label>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
              <Upload className="w-10 h-10 text-zinc-600 mb-2" />
              <span className="text-zinc-500">
                {uploadedCards.length > 0 ? `${uploadedCards.length} CARDS LOADED` : 'CLICK TO UPLOAD CSV'}
              </span>
              <input type="file" accept=".csv" onChange={onFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 text-white px-6 py-3 transition font-bold tracking-wide"
          >
            DISCARD
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-zinc-950 border-2 border-amber-600 hover:bg-amber-600 text-white px-6 py-3 transition font-bold tracking-wide"
          >
            SAVE DECK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeckModal;
