// @ts-nocheck
import React from 'react';

interface StepperIndicatorProps {
  steps: Array<{ id: number; title: string; description: string }>;
  currentStep: number;
}

const StepperIndicator: React.FC<StepperIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between mb-10 relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800 -z-10"></div>
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold
              ${currentStep >= step.id ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}
            `}
          >
            {step.id}
          </div>
          <div className="mt-2 text-center">
            <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-zinc-500'}`}>
              {step.title}
            </div>
            <div className="text-xs text-zinc-500 mt-1 hidden md:block">
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepperIndicator;