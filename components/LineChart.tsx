
import React from 'react';

interface LineChartPoint {
  x: number; // week or day
  y: number; // value
}

interface ChartSeries {
  name: string;
  data: LineChartPoint[];
  color: string;
}

interface LineChartProps {
  series: ChartSeries[];
  title: string;
  yAxisLabel: string;
  xAxisMax: number;
  xAxisLabel: string;
  xAxisUnit?: 'week' | 'day';
}

const getXAxisTicks = (max: number, unit: 'week' | 'day' = 'week'): number[] => {
    if (unit === 'day') {
        return Array.from({ length: max }, (_, i) => i + 1);
    }
    
    const ticks = [];
    let step = 1;

    if (max > 5 && max <= 13) { // Up to 3 months
        step = 2;
    } else if (max > 13) { // For 6 months and 1 year
        step = 4;
    }

    for (let i = step; i <= max; i += step) {
        ticks.push(i);
    }
    if (!ticks.includes(1) && max > 0) {
        ticks.unshift(1);
    }
    return ticks;
};


const LineChart: React.FC<LineChartProps> = ({ series, title, yAxisLabel, xAxisMax, xAxisLabel, xAxisUnit }) => {
    if (!series || series.length === 0 || series.every(s => s.data.length === 0)) {
        return (
          <div className="bg-[#161b22] p-6 rounded-lg text-center h-[400px] flex flex-col justify-center items-center border border-gray-800">
            <h4 className="text-lg font-bold text-gray-300">{title}</h4>
            <p className="text-gray-500 text-sm mt-4 max-w-xs">No hay datos suficientes para mostrar el gráfico.</p>
          </div>
        );
    }
    
    const padding = { top: 50, right: 30, bottom: 60, left: 60 };
    const svgWidth = 600;
    const svgHeight = 400; 
    const width = svgWidth - padding.left - padding.right;
    const height = svgHeight - padding.top - padding.bottom;
    
    const allPoints = series.flatMap(s => s.data);
    const minX = 1;
    const maxX = xAxisMax;
    
    const maxY = Math.max(...allPoints.map(p => p.y), 10);
    const minY = 0;
    
    const getX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * width;
    const getY = (y: number) => padding.top + height - ((y - minY) / (maxY - minY)) * height;
    
    const linePath = (data: LineChartPoint[]) => {
        if (data.length < 1) return '';
        const sortedData = [...data].sort((a,b) => a.x - b.x);
        let path = `M ${getX(sortedData[0].x)} ${getY(sortedData[0].y)}`;
        sortedData.slice(1).forEach(p => {
            path += ` L ${getX(p.x)} ${getY(p.y)}`;
        });
        return path;
    };
    
    const tickCount = 5;

    const yAxisTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round(minY + (maxY - minY) / tickCount * i));
    const xAxisTicks = getXAxisTicks(xAxisMax, xAxisUnit);

    return (
        <div className="bg-[#0D1117] p-4 sm:p-6 rounded-lg overflow-x-auto border border-gray-800">
             <div className="flex justify-between items-center mb-4 px-2">
                <h4 className="text-lg font-bold text-gray-200">{title}</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {series.map(s => (
                      s.data.length > 0 && <div key={s.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                        <span className="text-gray-300">{s.name}</span>
                      </div>
                    ))}
                </div>
            </div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="min-w-[500px]">
                {/* Grid Lines */}
                <g className="grid">
                    {yAxisTicks.map((tick, i) => i > 0 && (
                         <line key={`y-grid-${tick}`} x1={padding.left} x2={width + padding.left} y1={getY(tick)} y2={getY(tick)} stroke="#30363d" strokeDasharray="3 3"/>
                    ))}
                </g>
                
                {/* Y-Axis */}
                <g className="axis y-axis-left">
                    <text x={-(padding.top + height/2)} y={padding.left - 45} transform="rotate(-90)" textAnchor="middle" fill="#8b949e" fontSize="14" fontWeight="600" className="tracking-wide">{yAxisLabel}</text>
                    {yAxisTicks.map(tick => (
                        <text key={`y-tick-${tick}`} x={padding.left - 12} y={getY(tick) + 5} textAnchor="end" fill="#8b949e" fontSize="12" fontWeight="500">{tick}</text>
                    ))}
                </g>

                {/* X-Axis */}
                <g className="axis x-axis">
                   <text x={padding.left + width/2} y={height + padding.top + 45} textAnchor="middle" fill="#8b949e" fontSize="14" fontWeight="600" className="tracking-wide">{xAxisLabel}</text>
                    {xAxisTicks.map(tick => (
                        <text key={`x-tick-${tick}`} x={getX(tick)} y={height + padding.top + 25} textAnchor="middle" fill="#8b949e" fontSize="12">{tick}</text>
                    ))}
                </g>

                {/* Data Lines and Points */}
                {series.map(s => (
                    s.data.length > 0 && <g key={s.name}>
                        <path d={linePath(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" />
                        {s.data.map((point) => (
                           <circle key={`${s.name}-point-${point.x}`} cx={getX(point.x)} cy={getY(point.y)} r="5" fill={s.color} stroke="#0D1117" strokeWidth="2" />
                        ))}
                    </g>
                ))}
            </svg>
        </div>
    );
}

export default LineChart;
