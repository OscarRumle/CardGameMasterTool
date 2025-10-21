import { memo } from 'react';

const DecklistDisplay = memo(({ cards, color }) => {
  const uniqueCardsMap = new Map();
  cards.forEach(card => {
    const cardName = card['Card Name'] || card['Item Name'];
    if (cardName && !uniqueCardsMap.has(cardName)) {
      uniqueCardsMap.set(cardName, card);
    }
  });
  const uniqueCardsList = Array.from(uniqueCardsMap.values());

  return (
    <div className={`mb-6 bg-zinc-950 border-2 border-${color}-600 p-4 max-h-96 overflow-y-auto`}>
      <h3 className={`text-sm font-bold text-${color}-400 mb-3 tracking-wide sticky top-0 bg-zinc-950 pb-2`}>DECKLIST</h3>
      <div className="space-y-1">
        {uniqueCardsList.map((card, idx) => (
          <div key={idx} className={`p-2 text-xs ${idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 text-center">
                <span className="text-white font-bold text-xs">{card.Copies || 1}×</span>
              </div>
              <div className="flex-shrink-0 w-8 text-center">
                <span className={`text-${color}-400 font-mono font-bold`}>{card['Mana Cost'] || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white truncate">{card['Card Name']}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    card['Card Type'] === 'Minion' ? 'bg-green-600/30 text-green-400' :
                    card['Card Type'] === 'Spell' ? 'bg-blue-600/30 text-blue-400' :
                    card['Card Type'] === 'Upgrade' ? 'bg-purple-600/30 text-purple-400' :
                    'bg-red-600/30 text-red-400'
                  }`}>
                    {card['Card Type']}
                  </span>
                  {card['Card Type'] === 'Minion' && (
                    <>
                      <span className="text-zinc-500">|</span>
                      <span className="text-white font-mono text-xs">{card.Attack}/{card.Health}</span>
                      <span className="text-zinc-500">|</span>
                      <span className="text-amber-500 text-xs">{card.Bounty}</span>
                    </>
                  )}
                </div>
                <p className="text-zinc-400 text-xs leading-tight line-clamp-2">{card.Effect || 'No effect text'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DecklistDisplay.displayName = 'DecklistDisplay';

export default DecklistDisplay;
