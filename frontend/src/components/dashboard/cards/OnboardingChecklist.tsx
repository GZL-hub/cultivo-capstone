import React, { useMemo } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Map, MapPin, Activity, Camera, PartyPopper } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface OnboardingChecklistProps {
  hasFarm: boolean;
  hasFarmBoundary: boolean;
  sensorCount: number;
  cameraCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDismiss: () => void;
  onNavigate: (route: string) => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  route: string;
  icon: LucideIcon;
  ctaText: string;
  disabled?: boolean;
  badge?: string;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  hasFarm,
  hasFarmBoundary,
  sensorCount,
  cameraCount,
  isCollapsed,
  onToggleCollapse,
  onDismiss,
  onNavigate
}) => {
  const steps: OnboardingStep[] = useMemo(() => [
    {
      id: 'farm',
      title: 'Create Your Farm',
      description: 'Set up your farm profile with basic information',
      isComplete: hasFarm,
      route: '/farm/map',
      icon: Map,
      ctaText: 'Create Farm'
    },
    {
      id: 'boundary',
      title: 'Draw Farm Boundary',
      description: 'Define your farm area on the map for accurate monitoring',
      isComplete: hasFarmBoundary,
      route: '/farm/map',
      icon: MapPin,
      ctaText: 'Draw Boundary',
      disabled: !hasFarm
    },
    {
      id: 'sensors',
      title: 'Add Soil Sensors',
      description: 'Connect IoT sensors to monitor soil conditions',
      isComplete: sensorCount > 0,
      route: '/device-settings/sensors',
      icon: Activity,
      ctaText: 'Add Sensors',
      badge: sensorCount > 0 ? `${sensorCount} added` : undefined
    },
    {
      id: 'cameras',
      title: 'Add CCTV Cameras',
      description: 'Set up cameras for real-time farm surveillance',
      isComplete: cameraCount > 0,
      route: '/device-settings/cameras',
      icon: Camera,
      ctaText: 'Add Cameras',
      badge: cameraCount > 0 ? `${cameraCount} added` : undefined
    }
  ], [hasFarm, hasFarmBoundary, sensorCount, cameraCount]);

  const completedSteps = steps.filter(s => s.isComplete).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const isComplete = completedSteps === totalSteps;

  const handleStepClick = (step: OnboardingStep) => {
    if (!step.disabled) {
      onNavigate(step.route);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-lg overflow-hidden mb-4">
      {/* Header */}
      <div
        className="bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/90 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-3">
          {isComplete ? (
            <PartyPopper className="h-6 w-6 text-green-600" />
          ) : (
            <div className="relative">
              <Circle className="h-6 w-6 text-blue-600" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
                {completedSteps}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isComplete ? 'Setup Complete!' : 'Get Started with Cultivo'}
            </h3>
            <p className="text-sm text-gray-600">
              {isComplete
                ? 'Your farm is ready. Dismiss this message to continue.'
                : `${completedSteps} of ${totalSteps} steps completed`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {completionPercentage}%
            </span>
          </div>

          {/* Collapse Button */}
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Steps */}
      {!isCollapsed && (
        <div className="p-6 space-y-3">
          {isComplete ? (
            // Completion Message
            <div className="bg-white rounded-lg p-6 text-center space-y-3">
              <PartyPopper className="h-12 w-12 text-green-600 mx-auto" />
              <h4 className="text-xl font-semibold text-gray-800">
                Congratulations!
              </h4>
              <p className="text-gray-600">
                You've completed the initial setup. You can now monitor your farm, view analytics, and manage your devices.
              </p>
              <button
                onClick={onDismiss}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : (
            // Steps List
            steps.map((step, index) => {
              const StepIcon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div
                  key={step.id}
                  className={`
                    ${step.isComplete ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white border-l-4 border-gray-300'}
                    rounded-lg p-4 transition-all duration-300
                    ${step.disabled ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step Icon & Status */}
                    <div className="flex-shrink-0">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${step.isComplete ? 'bg-green-100' : 'bg-gray-100'}
                      `}>
                        {step.isComplete ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <StepIcon className={`h-6 w-6 ${step.disabled ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-semibold text-gray-800">
                          {step.title}
                        </h4>
                        {step.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {step.badge}
                          </span>
                        )}
                        {step.isComplete && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>

                      {/* CTA Button */}
                      {!step.isComplete && (
                        <button
                          onClick={() => handleStepClick(step)}
                          disabled={step.disabled}
                          className={`
                            mt-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${step.disabled
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary/90'
                            }
                          `}
                        >
                          {step.ctaText}
                        </button>
                      )}
                    </div>

                    {/* Step Number */}
                    <div className="flex-shrink-0 hidden sm:block">
                      <span className="text-2xl font-bold text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;
