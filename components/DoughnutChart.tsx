
import React from 'react';

interface ChartData {
  count: number;
  color: string;
  label: string;
}

interface DoughnutChartProps {
  data: ChartData[];
  title: string;
  icon?: React.ReactNode;
  showTotal?: boolean;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, title, icon, showTotal = true }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg h-full">
        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
            {icon}{title}
        </h4>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 flex items-center justify-center flex-grow">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-gray-700"
                    strokeWidth="15"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                />
            </svg>
             {showTotal && <span className="absolute text-2xl font-bold text-gray-500">0</span>}
        </div>
        <p className="text-gray-500 mt-2 text-sm text-center">Sin datos</p>
      </div>
    );
  }

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg h-full">
        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
           {icon}{title}
        </h4>
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
           <circle
            className="text-gray-700"
            strokeWidth="15"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {data.map((item, index) => {
            if (item.count === 0) return null;

            const percentage = item.count / total;
            const angle = percentage * 360;
            const rotation = accumulatedAngle;
            accumulatedAngle += angle;

            return (
              <circle
                key={index}
                strokeWidth="15"
                stroke={item.color}
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                strokeDasharray={`${percentage * circumference} ${circumference}`}
                style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
              />
            );
          })}
        </svg>
        {showTotal && <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
          {total}
        </span>}
      </div>
      <div className="flex flex-col items-start gap-1 text-sm w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                 <span className="capitalize">{item.label}</span>
              </div>
            <span>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChart;
