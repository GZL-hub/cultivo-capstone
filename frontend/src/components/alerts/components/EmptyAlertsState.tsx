import React from 'react';
import { CheckCircle } from 'lucide-react';

interface EmptyAlertsStateProps {
  hasFilters: boolean;
}

const EmptyAlertsState: React.FC<EmptyAlertsStateProps> = ({ hasFilters }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <div className="text-center bg-white rounded-lg shadow-md p-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">All Clear!</h3>
        <p className="text-gray-500">
          {hasFilters
            ? 'No alerts match your filters.'
            : 'No alerts found. Your farm systems are operating normally.'}
        </p>
      </div>
    </div>
  );
};

export default EmptyAlertsState;