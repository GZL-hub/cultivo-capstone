import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AlertCircle, Inbox, MapPin, Camera, Activity, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'warning' | 'info';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className = ''
}) => {
  const iconColorClass = {
    default: 'text-gray-400',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }[variant];

  const DefaultIcon = Icon || Inbox;

  return (
    <div className={`flex items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <DefaultIcon className={`w-16 h-16 ${iconColorClass}`} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {description}
        </p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Export common icons for convenience
export { MapPin, Camera, Activity, Users, AlertCircle, Inbox };
export default EmptyState;
