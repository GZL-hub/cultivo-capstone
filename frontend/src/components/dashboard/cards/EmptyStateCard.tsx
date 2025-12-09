import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  ctaText,
  onCtaClick,
  variant = 'default',
  className = ''
}) => {
  const getIconSize = () => {
    switch (variant) {
      case 'minimal':
        return 'w-8 h-8';
      case 'compact':
        return 'w-12 h-12';
      case 'default':
      default:
        return 'w-16 h-16';
    }
  };

  const getIconInnerSize = () => {
    switch (variant) {
      case 'minimal':
        return 'h-4 w-4';
      case 'compact':
        return 'h-6 w-6';
      case 'default':
      default:
        return 'h-8 w-8';
    }
  };

  const getTitleSize = () => {
    switch (variant) {
      case 'minimal':
        return 'text-base';
      case 'compact':
        return 'text-lg';
      case 'default':
      default:
        return 'text-xl';
    }
  };

  const getSpacing = () => {
    switch (variant) {
      case 'minimal':
        return 'space-y-1';
      case 'compact':
        return 'space-y-2';
      case 'default':
      default:
        return 'space-y-3';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${getSpacing()} ${className}`}>
      {/* Icon */}
      <div className={`${getIconSize()} rounded-full bg-gray-100 flex items-center justify-center`}>
        <Icon className={`${getIconInnerSize()} text-gray-400`} />
      </div>

      {/* Title */}
      <h3 className={`${getTitleSize()} font-semibold text-gray-700`}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 max-w-sm">
        {description}
      </p>

      {/* CTA Button */}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-200"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyStateCard;
