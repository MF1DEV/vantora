interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = '#3b82f6', height = 30 }: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';

  return (
    <div className="relative">
      <svg width="100" height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
          style={{ filter: 'drop-shadow(0 0 4px currentColor)', opacity: 0.8 }}
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = height - ((value - min) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className={`text-[10px] font-medium mt-1 ${
        trend === 'up' ? 'text-green-400' : 'text-orange-400'
      }`}>
        {trend === 'up' ? '↗' : '↘'} {Math.abs(data[data.length - 1] - data[0])} this week
      </div>
    </div>
  );
}
