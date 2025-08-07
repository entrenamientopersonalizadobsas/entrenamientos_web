
import React from 'react';

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  title: string;
  barColor: string;
  yAxisLabel: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, barColor, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#161b22] p-6 rounded-lg text-center h-[400px] flex flex-col justify-center items-center border border-gray-800">
        <h4 className="text-lg font-bold text-gray-300">{title}</h4>
        <p className="text-gray-500 text-sm mt-4 max-w-xs">No hay datos para mostrar el gráfico.</p>
      </div>
    );
  }

  const padding = { top: 50, right: 20, bottom: 100, left: 60 };
  const svgWidth = 600;
  const svgHeight = 400;
  const width = svgWidth - padding.left - padding.right;
  const height = svgHeight - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const yScale = (value: number) => height - (value / maxValue) * height;

  const barWidth = width / data.length * 0.7;
  const barSpacing = width / data.length * 0.3;

  const yAxisTicksCount = 5;
  const yAxisTicks = Array.from({ length: yAxisTicksCount + 1 }, (_, i) => 
    Math.ceil((maxValue / yAxisTicksCount) * i)
  ).filter((v, i, a) => a.indexOf(v) === i); // Keep unique values

  return (
    <div className="bg-[#0D1117] p-4 sm:p-6 rounded-lg overflow-x-auto border border-gray-800">
      <h4 className="text-lg font-bold text-gray-200 text-center mb-4">{title}</h4>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="min-w-[500px]">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Y-Axis Grid Lines */}
          {yAxisTicks.map((tick, i) => i > 0 && (
            <line
              key={`y-grid-${tick}`}
              x1="0"
              x2={width}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#30363d"
              strokeDasharray="3 3"
            />
          ))}

          {/* Y-Axis */}
          <g className="axis y-axis">
            <text
              transform={`translate(${-45}, ${height / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="#8b949e"
              fontSize="14"
              fontWeight="600"
            >
              {yAxisLabel}
            </text>
            {yAxisTicks.map(tick => (
              <text
                key={`y-tick-${tick}`}
                x={-10}
                y={yScale(tick) + 5}
                textAnchor="end"
                fill="#8b949e"
                fontSize="12"
              >
                {tick}
              </text>
            ))}
          </g>

          {/* Bars and X-Axis Labels */}
          {data.map((d, i) => {
            const x = i * (barWidth + barSpacing) + barSpacing / 2;
            const y = yScale(d.value);
            const barHeight = height - y;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight < 0 ? 0 : barHeight}
                  fill={barColor}
                  rx="2"
                  ry="2"
                />
                <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                >
                    {d.value}
                </text>
                <foreignObject x={x} y={height + 5} width={barWidth} height={padding.bottom - 5}>
                    <p className="text-xs text-center text-gray-400 break-words leading-tight">
                        {d.label}
                    </p>
                </foreignObject>
              </g>
            );
          })}

          {/* Base Line for X-Axis */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="#30363d" />
        </g>
      </svg>
    </div>
  );
};


export default BarChart;
