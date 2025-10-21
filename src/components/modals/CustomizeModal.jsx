const CustomizeModal = ({ deck, onUpdateCustomization, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border-2 border-zinc-800 p-8 max-w-3xl w-full my-8">
        <h2 className="text-3xl font-bold text-amber-500 mb-6 tracking-wider">CUSTOMIZE: {deck.name}</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-zinc-400 mb-3 font-bold tracking-wide">FONT FAMILY</label>
            <select
              value={deck.customization.font}
              onChange={(e) => onUpdateCustomization({ font: e.target.value })}
              className="w-full bg-black text-white px-4 py-3 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
            >
              {[
                ['Arial, sans-serif', 'Arial'],
                ['Helvetica, sans-serif', 'Helvetica'],
                ['"Times New Roman", serif', 'Times New Roman'],
                ['Georgia, serif', 'Georgia'],
                ['"Courier New", monospace', 'Courier New'],
                ['Verdana, sans-serif', 'Verdana']
              ].map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-3 font-bold tracking-wide">BORDER COLORS</label>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(deck.customization).filter(k => k !== 'font').map(category => (
                <div key={category} className="bg-zinc-950 border-2 border-zinc-800 p-4">
                  <h3 className="text-white font-bold mb-3 capitalize tracking-wide">{category}</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={deck.customization[category].color}
                      onChange={(e) => onUpdateCustomization({ [category]: { color: e.target.value } })}
                      className="w-12 h-8 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={deck.customization[category].color}
                      onChange={(e) => onUpdateCustomization({ [category]: { color: e.target.value } })}
                      className="flex-1 bg-black text-white px-3 py-2 text-sm border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-zinc-950 border-2 border-amber-600 hover:bg-amber-600 text-white px-6 py-3 transition font-bold tracking-wide"
        >
          DONE
        </button>
      </div>
    </div>
  );
};

export default CustomizeModal;
