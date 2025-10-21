const GoldGraph = ({ data, color }) => {
  if (!data || data.length === 0) return null;

  const width = 300;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxRound = Math.max(...data.map(d => d.round));
  const maxGold = Math.max(...data.map(d => d.cumulativeGold));

  const xScale = (round) => padding.left + (round / maxRound) * chartWidth;
  const yScale = (gold) => padding.top + chartHeight - (gold / maxGold) * chartHeight;

  // Generate path for line
  const linePath = data
    .map((d, i) => {
      const x = xScale(d.round);
      const y = yScale(d.cumulativeGold);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Color mapping
  const colorMap = {
    green: { stroke: '#22c55e', fill: '#16a34a20', text: '#22c55e' },
    blue: { stroke: '#3b82f6', fill: '#2563eb20', text: '#3b82f6' },
    amber: { stroke: '#f59e0b', fill: '#d9770620', text: '#f59e0b' }
  };

  const colors = colorMap[color] || colorMap.amber;

  // X-axis labels (show every 2 rounds to avoid crowding)
  const xAxisLabels = [];
  for (let i = 0; i <= maxRound; i += 2) {
    xAxisLabels.push(i);
  }

  // Y-axis labels (5 evenly spaced)
  const yAxisLabels = [];
  for (let i = 0; i <= 5; i++) {
    yAxisLabels.push(Math.round((maxGold / 5) * i));
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-zinc-400 mb-2">GOLD ACCUMULATION</h3>
      <svg width={width} height={height} className="bg-black border-2 border-zinc-800">
        {/* Grid lines (Y-axis) */}
        {yAxisLabels.map((gold) => (
          <g key={`grid-y-${gold}`}>
            <line
              x1={padding.left}
              y1={yScale(gold)}
              x2={width - padding.right}
              y2={yScale(gold)}
              stroke="#27272a"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </g>
        ))}

        {/* Grid lines (X-axis) */}
        {xAxisLabels.map((round) => (
          <g key={`grid-x-${round}`}>
            {round > 0 && (
              <line
                x1={xScale(round)}
                y1={padding.top}
                x2={xScale(round)}
                y2={height - padding.bottom}
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )}
          </g>
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#52525b"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#52525b"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {xAxisLabels.map((round) => (
          <text
            key={`label-x-${round}`}
            x={xScale(round)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="10"
          >
            R{round}
          </text>
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map((gold) => (
          <text
            key={`label-y-${gold}`}
            x={padding.left - 10}
            y={yScale(gold) + 4}
            textAnchor="end"
            fill="#a1a1aa"
            fontSize="10"
          >
            {gold}g
          </text>
        ))}

        {/* Area under the line */}
        <path
          d={`${linePath} L ${xScale(maxRound)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
          fill={colors.fill}
          stroke="none"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d) => (
          <circle
            key={`point-${d.round}`}
            cx={xScale(d.round)}
            cy={yScale(d.cumulativeGold)}
            r="4"
            fill={colors.stroke}
            stroke="#000"
            strokeWidth="2"
          />
        ))}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fill="#a1a1aa"
          fontSize="11"
          fontWeight="bold"
        >
          ROUND
        </text>

        <text
          x={15}
          y={padding.top - 5}
          textAnchor="start"
          fill="#a1a1aa"
          fontSize="11"
          fontWeight="bold"
        >
          GOLD
        </text>
      </svg>

      {/* Summary Stats */}
      <div className="mt-2 p-2 bg-black border-2 border-zinc-800">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">Round {maxRound}:</span>
            <span className={`ml-2 font-bold text-${color}-500`}>
              {data[data.length - 1]?.cumulativeGold.toFixed(1)}g
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Max Gold:</span>
            <span className={`ml-2 font-bold text-${color}-500`}>
              {maxGold.toFixed(1)}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldGraph;
