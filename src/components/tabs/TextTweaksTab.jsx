import { Trash2 } from 'lucide-react';

const TextTweaksTab = ({ keywords, newKeyword, setNewKeyword, addKeyword, removeKeyword, textSettings, updateTextSetting }) => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-amber-500 mb-8 tracking-wider">TEXT TWEAKS</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border-2 border-zinc-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">KEYWORDS</h2>
          <p className="text-zinc-400 text-sm mb-6">Words that will appear in bold on all cards</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Add keyword (e.g., Rage)"
              className="flex-1 bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
            />
            <button
              onClick={addKeyword}
              className="bg-zinc-950 border-2 border-amber-600 hover:bg-amber-600 text-white px-6 py-2 transition font-bold"
            >
              ADD
            </button>
          </div>

          <div className="space-y-2">
            {keywords.length === 0 ? (
              <div className="text-zinc-600 text-center py-8 border-2 border-dashed border-zinc-800">
                No keywords yet. Add your first keyword above.
              </div>
            ) : (
              keywords.map(keyword => (
                <div key={keyword} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-4 py-2">
                  <span className="text-white font-mono">{keyword}</span>
                  <button onClick={() => removeKeyword(keyword)} className="text-red-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border-2 border-zinc-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">FONT SIZES</h2>
          <p className="text-zinc-400 text-sm mb-6">Adjust text sizes (in pt)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 mb-2 font-bold text-sm">Effect Text - Standard Size</label>
              <input
                type="number"
                value={textSettings.standardEffectSize}
                onChange={(e) => updateTextSetting('standardEffectSize', e.target.value)}
                min="6"
                max="24"
                className="w-full bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
              />
              <p className="text-zinc-600 text-xs mt-1">Auto-sizes down from this size to fit</p>
            </div>

            <div>
              <label className="block text-zinc-400 mb-2 font-bold text-sm">Effect Text - Minimum Size</label>
              <input
                type="number"
                value={textSettings.minEffectSize}
                onChange={(e) => updateTextSetting('minEffectSize', e.target.value)}
                min="4"
                max="16"
                className="w-full bg-black text-white px-4 py-2 border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
              />
              <p className="text-zinc-600 text-xs mt-1">Won't shrink smaller than this</p>
            </div>

            <div className="border-t border-zinc-800 pt-4 mt-4">
              <h3 className="text-white font-bold mb-3 text-sm">Other Text Elements</h3>

              {[
                ['cardNameSize', 'Card Name Size'],
                ['typeLineSize', 'Type Line Size'],
                ['costSize', 'Mana Cost Size']
              ].map(([key, label]) => (
                <div key={key} className="mb-3">
                  <label className="block text-zinc-400 mb-1 text-xs">{label}</label>
                  <input
                    type="number"
                    value={textSettings[key]}
                    onChange={(e) => updateTextSetting(key, e.target.value)}
                    min="4"
                    max="20"
                    className="w-full bg-black text-white px-3 py-1 text-sm border-2 border-zinc-800 focus:border-amber-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-950 border border-zinc-800">
            <p className="text-amber-500 text-xs font-bold mb-1">💡 TIP</p>
            <p className="text-zinc-400 text-xs">
              Effect text auto-sizes from Standard → Minimum to fit the card. Other elements use fixed sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTweaksTab;
