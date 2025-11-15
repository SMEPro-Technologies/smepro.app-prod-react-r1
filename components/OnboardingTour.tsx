
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { CloseIcon } from './icons';

interface TourStep {
  target: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TourStep[] = [
  {
    target: '[data-tour-id="sme-selector-0"]',
    content: 'Start by selecting an industry or category that matches your needs.',
    position: 'bottom',
  },
  {
    target: '[data-tour-id="sme-selector-1"]',
    content: 'Next, narrow down your focus by choosing a sub-type.',
    position: 'bottom',
  },
  {
    target: '[data-tour-id="sme-selector-2"]',
    content: 'Finally, pick a specific segment to talk to a specialized expert.',
    position: 'top',
  },
  {
    target: '[data-tour-id="sme-selector-submit"]',
    content: 'Once configured, click here to start your chat session!',
    position: 'top',
  },
  {
    target: '[data-tour-id="chat-header"]',
    content: 'In the chat window, you\'ll find session controls and information here.',
    position: 'bottom'
  },
  {
    target: '[data-tour-id="chat-header-vault"]',
    content: 'You can save important insights to your personal Vault at any time.',
    position: 'bottom'
  },
  {
    target: '[data-tour-id="chat-input"]',
    content: 'Type your questions here to interact with your AI expert. That\'s it! Enjoy using SMEPro Lite.',
    position: 'top'
  }
];

interface OnboardingTourProps {
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const isLastStep = stepIndex === steps.length - 1;
  const currentStep = steps[stepIndex];

  const updateTargetRect = useCallback(() => {
    if (currentStep) {
      const element = document.querySelector(currentStep.target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null); // Hide if element not found
      }
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    if (currentStep) {
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const timer = setTimeout(() => {
            updateTargetRect();
        }, 300); // Wait for scroll animation
        return () => clearTimeout(timer);
      }
    }
  }, [stepIndex, currentStep, updateTargetRect]);

  useEffect(() => {
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (isLastStep) {
      onFinish();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  if (!targetRect || !currentStep) return null;
  
  const tooltipStyle: React.CSSProperties = {
      position: 'absolute',
      top: targetRect.top,
      left: targetRect.left,
      zIndex: 1001,
      transform: `translate(
          ${currentStep.position === 'right' ? `${targetRect.width + 15}px` : currentStep.position === 'left' ? `calc(-100% - 15px)` : `calc(${targetRect.width/2}px - 125px)`},
          ${currentStep.position === 'bottom' ? `${targetRect.height + 15}px` : currentStep.position === 'top' ? `calc(-100% - 15px)` : `calc(${targetRect.height/2}px - 50%)`}
      )`,
      width: '250px',
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/70 animate-fade-in" onClick={onFinish} />
      
      <div 
        className="fixed transition-all duration-300 ease-in-out bg-transparent border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/50 pointer-events-none"
        style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
        }}
      />

      <div style={tooltipStyle} className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-white animate-slide-in-up">
        <p className="text-sm">{currentStep.content}</p>
        <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-slate-400">{stepIndex + 1} / {steps.length}</span>
            <div>
              <button onClick={onFinish} className="text-sm text-slate-400 hover:text-white mr-4">Skip</button>
              <button onClick={handleNext} className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-sm font-semibold rounded-md">
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
