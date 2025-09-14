import React, { ReactNode } from 'react';

// Status types for the sensors
type StatusType = 'normal' | 'warning' | 'alert' | 'inactive' | 'online';

interface SensorCardProps {
  title: string;
  icon: any; // Use 'any' to bypass TypeScript checking for the icon
  status?: StatusType;
  children?: ReactNode;
  onClick?: () => void;
  className?: string; // Add custom className prop
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon: Icon,
  status,
  children,
  onClick,
  className = "" // Default to empty string
}) => {
  // Check if we have a gradient background class to determine text color
  const hasGradientBg = className.includes('bg-gradient') || className.includes('from-');
  const textColorClass = hasGradientBg ? 'text-white' : 'text-gray-700';
  const iconColorClass = hasGradientBg ? 'text-white' : 'text-gray-500';
  
  return (
    <div 
      className={`border border-gray-200 rounded-md p-3 relative transition-all hover:shadow-md ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-1">
        <h3 className={`text-sm font-medium ${textColorClass} flex items-center`}>
          {title}
        </h3>
        <div className={`text-lg ${iconColorClass}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      
      {/* Content area */}
      <div className="h-[calc(100%-1.75rem)] pt-4">
        {children}
      </div>
    </div>
  );
};

export default SensorCard;