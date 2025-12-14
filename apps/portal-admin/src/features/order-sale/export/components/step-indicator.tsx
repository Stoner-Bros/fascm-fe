'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { EXPORT_TICKET_STEPS, ExportTicketStep, STEP_LABELS } from '../types';

interface StepIndicatorProps {
  currentStep: ExportTicketStep;
  canProceed: (step: ExportTicketStep) => boolean;
  isStepAccessible: (step: ExportTicketStep) => boolean;
  onStepClick: (step: ExportTicketStep) => void;
}

export function StepIndicator({
  currentStep,
  canProceed,
  isStepAccessible,
  onStepClick
}: StepIndicatorProps) {
  const currentIndex = EXPORT_TICKET_STEPS.indexOf(currentStep);

  return (
    <div className='w-full'>
      {/* Desktop view - horizontal stepper */}
      <div className='hidden md:flex md:items-center md:justify-between'>
        {EXPORT_TICKET_STEPS.map((step, index) => {
          const isCompleted =
            index < currentIndex ||
            (index === currentIndex && canProceed(step));
          const isCurrent = step === currentStep;
          const isAccessible = isStepAccessible(step);
          const isPast = index < currentIndex;

          return (
            <div key={step} className='flex flex-1 items-center'>
              {/* Step circle and label */}
              <button
                type='button'
                onClick={() => isAccessible && onStepClick(step)}
                disabled={!isAccessible}
                className={cn(
                  'flex flex-col items-center gap-2',
                  isAccessible
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    isPast &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    !isPast &&
                      !isCurrent &&
                      'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isPast ? <Check className='h-5 w-5' /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isCurrent && 'text-primary',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>

              {/* Connector line */}
              {index < EXPORT_TICKET_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    isPast ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view - vertical compact stepper */}
      <div className='flex flex-col gap-2 md:hidden'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-sm font-medium'>
            Bước {currentIndex + 1} / {EXPORT_TICKET_STEPS.length}
          </span>
          <span className='text-primary text-sm font-semibold'>
            {STEP_LABELS[currentStep]}
          </span>
        </div>
        <div className='flex gap-1'>
          {EXPORT_TICKET_STEPS.map((step, index) => {
            const isPast = index < currentIndex;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  isPast && 'bg-primary',
                  isCurrent && 'bg-primary/50',
                  !isPast && !isCurrent && 'bg-muted-foreground/30'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
