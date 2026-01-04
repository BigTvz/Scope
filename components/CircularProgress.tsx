
import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 10 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Dynamic font sizing based on the component's pixel size
  const getFontSize = () => {
    if (size < 60) return 'text-[8px]';
    if (size < 90) return 'text-sm';
    if (size < 110) return 'text-lg';
    return 'text-2xl';
  };

  const isVerySmall = size < 80;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#CCFF00"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            strokeLinecap: 'round'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${getFontSize()} font-black text-white leading-none`}>
          {Math.round(percentage)}%
        </span>
        {!isVerySmall && (
          <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium mt-1">Paid</span>
        )}
      </div>
    </div>
  );
};
