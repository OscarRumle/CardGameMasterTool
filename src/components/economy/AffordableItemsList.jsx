import { useState } from 'react';

const AffordableItemsList = ({ simulation, color }) => {
  const [expandedRound, setExpandedRound] = useState(null);

  if (!simulation || simulation.length === 0) return null;

  const toggleRound = (round) => {
    setExpandedRound(expandedRound === round ? null : round);
  };

  // Color mapping
  const colorMap = {
    green: { border: 'border-green-600', text: 'text-green-500', bg: 'bg-green-900/20' },
    blue: { border: 'border-blue-600', text: 'text-blue-500', bg: 'bg-blue-900/20' },
    amber: { border: 'border-amber-600', text: 'text-amber-500', bg: 'bg-amber-900/20' }
  };

  const colors = colorMap[color] || colorMap.amber;

  // Only show rounds where tier changes or items become available
  const significantRounds = simulation.filter((round, index) => {
    // Show tier change rounds
    if (index > 0 && round.availableTier !== simulation[index - 1].availableTier) {
      return true;
    }
    // Show rounds where new items become affordable
    if (round.affordableItems.length > 0 && (index === 0 || round.affordableItems.length > simulation[index - 1].affordableItems.length)) {
      return true;
    }
    // Show round 1 and last round
    return round.round === 1 || index === simulation.length - 1;
  });

  return (
    <div>
      <h3 className="text-sm font-bold text-zinc-400 mb-2">AFFORDABLE ITEMS BY ROUND</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {significantRounds.map((roundData) => {
          const isExpanded = expandedRound === roundData.round;
          const hasItems = roundData.affordableItems.length > 0;

          return (
            <div
              key={roundData.round}
              className={`bg-black border-2 ${colors.border} overflow-hidden transition-all`}
            >
              {/* Round Header */}
              <button
                onClick={() => toggleRound(roundData.round)}
                className="w-full p-3 flex items-center justify-between hover:bg-zinc-900 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${colors.text}`}>
                    R{roundData.round}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {roundData.cumulativeGold.toFixed(1)}g
                  </span>
                  <span className="text-xs text-amber-500">
                    Tier {roundData.availableTier}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasItems ? (
                    <span className="text-xs text-zinc-400">
                      {roundData.affordableItems.length} items
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">None</span>
                  )}
                  <span className="text-zinc-500 text-sm">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Expanded Items List */}
              {isExpanded && (
                <div className={`p-3 pt-0 border-t-2 ${colors.border} ${colors.bg}`}>
                  {hasItems ? (
                    <div className="space-y-2">
                      {roundData.affordableItems.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="bg-black p-2 border border-zinc-800"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-white text-sm">
                                {item.name}
                              </div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {item.slot}
                              </div>
                              {item.effect && (
                                <div className="text-xs text-zinc-400 mt-1 italic">
                                  {item.effect}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex flex-col items-end gap-1">
                              <span className="text-amber-500 font-bold text-sm">
                                {item.cost}g
                              </span>
                              <span className="text-xs text-zinc-600">
                                T{item.tier}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">
                      No items affordable at this round
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {significantRounds.length === 0 && (
          <div className="p-4 bg-black border-2 border-zinc-800 text-center">
            <p className="text-zinc-600 text-sm">
              No items available or insufficient gold
            </p>
          </div>
        )}
      </div>

      {/* Quick Summary */}
      <div className="mt-3 p-2 bg-black border-2 border-zinc-800">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">First Purchase:</span>
            <span className="text-zinc-300">
              {simulation.find(r => r.affordableItems.length > 0)?.round
                ? `Round ${simulation.find(r => r.affordableItems.length > 0).round}`
                : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Total Unique Items:</span>
            <span className="text-zinc-300">
              {simulation[simulation.length - 1]?.affordableItems.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffordableItemsList;
