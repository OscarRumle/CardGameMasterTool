import { memo } from 'react';

const ManaCurveDisplay = memo(({ curve, totalCards, color, title }) => {
  // Map color to actual Tailwind classes
  const textClass = color === 'green' ? 'text-green-400' : 'text-blue-400';
  const bgClass = color === 'green' ? 'bg-green-600' : 'bg-blue-600';

  if (Object.keys(curve).length === 0 || totalCards === 0) {
    return (
      <>
        <h4 className={`text-base font-bold ${textClass} mb-3 tracking-wide`}>{title}</h4>
        <p className="text-zinc-600 text-sm italic">No cards in this category</p>
      </>
    );
  }

  return (
    <>
      <h4 className={`text-base font-bold ${textClass} mb-3 tracking-wide`}>{title}</h4>
      <div className="space-y-2">
        {Object.entries(curve).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cost, count]) => (
          <div key={cost} className="flex items-center gap-2">
            <span className="text-white font-mono w-6 text-sm">{cost}:</span>
            <div className="flex-1 bg-zinc-900 h-5 relative">
              <div
                className={`${bgClass} h-full transition-all`}
                style={{ width: `${(count / totalCards) * 100}%` }}
              />
            </div>
            <span className="text-zinc-400 font-mono w-10 text-right text-sm">{count}x</span>
          </div>
        ))}
      </div>
    </>
  );
});

ManaCurveDisplay.displayName = 'ManaCurveDisplay';

export default ManaCurveDisplay;
