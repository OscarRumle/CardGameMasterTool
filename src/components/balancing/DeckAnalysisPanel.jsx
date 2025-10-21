import { memo } from 'react';
import { FileText } from 'lucide-react';
import ManaCurveDisplay from './ManaCurveDisplay';

const DeckAnalysisPanel = memo(({ deck, analysis, color }) => {
  if (!analysis) {
    return (
      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 p-12 text-center">
        <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">Select a deck above</p>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-950 border-2 border-${color}-600 p-4 space-y-6`}>
      <h3 className="text-xl font-bold text-white tracking-wide">{deck.name}</h3>

      <div>
        <ManaCurveDisplay
          curve={analysis.manaCurve}
          totalCards={analysis.totalCards}
          color={color}
          title="MANA CURVE (ALL CARDS)"
        />
      </div>

      <div>
        <ManaCurveDisplay
          curve={analysis.minionManaCurve}
          totalCards={analysis.minionCount}
          color={color}
          title="MINION MANA CURVE"
        />
      </div>

      <div>
        <ManaCurveDisplay
          curve={analysis.spellManaCurve}
          totalCards={analysis.spellCount}
          color={color}
          title="SPELL MANA CURVE"
        />
      </div>

      <div>
        <h4 className={`text-base font-bold text-${color}-400 mb-3 tracking-wide`}>CARD TYPES</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-zinc-900 p-2">
            <span className="text-white text-sm">Spells</span>
            <span className={`text-${color}-400 font-bold`}>{analysis.spellCount}</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-900 p-2">
            <span className="text-white text-sm">Minions</span>
            <span className={`text-${color}-400 font-bold`}>{analysis.minionCount}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className={`text-base font-bold text-${color}-400 mb-3 tracking-wide`}>MINION STRENGTH</h4>
        <div className="bg-zinc-900 p-3 text-center">
          <span className="text-2xl font-bold text-white">
            {analysis.totalAttack} / {analysis.totalHealth}
          </span>
          <p className="text-zinc-500 text-xs mt-1">Attack / Health</p>
        </div>
      </div>

      <div>
        <h4 className={`text-base font-bold text-${color}-400 mb-3 tracking-wide`}>TOTAL MINION GOLD</h4>
        <div className="bg-zinc-900 p-3 text-center">
          <span className="text-2xl font-bold text-amber-500">💰 {analysis.totalMinionGold}g</span>
          <p className="text-zinc-500 text-xs mt-1">If all minions killed</p>
        </div>
      </div>

      <div>
        <h4 className={`text-base font-bold text-${color}-400 mb-3 tracking-wide`}>UNIQUE CARDS</h4>
        <div className="flex justify-between items-center bg-zinc-900 p-2">
          <span className="text-white text-sm">Distinct cards</span>
          <span className={`text-${color}-400 font-bold`}>{analysis.uniqueCards}</span>
        </div>
      </div>

      <div>
        <h4 className={`text-base font-bold text-${color}-400 mb-3 tracking-wide`}>KEYWORD USAGE</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-zinc-900 p-2">
            <span className="text-white text-sm">With keywords</span>
            <span className={`text-${color}-400 font-bold`}>{analysis.keywordCards}</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-900 p-2">
            <span className="text-white text-sm">Without keywords</span>
            <span className="text-zinc-400 font-bold">{analysis.nonKeywordCards}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

DeckAnalysisPanel.displayName = 'DeckAnalysisPanel';

export default DeckAnalysisPanel;
