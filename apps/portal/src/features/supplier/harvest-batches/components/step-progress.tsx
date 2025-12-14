'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IconPackage, IconCalendar, IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { Step } from '../types';

type StepConfig = {
  id: Step;
  label: string;
  icon: typeof IconPackage;
};

type StepProgressProps = {
  currentStep: Step;
  t: (key: string) => string;
};

export function StepProgress({ currentStep, t }: StepProgressProps) {
  const steps: StepConfig[] = [
    { id: 'products', label: t('new.steps.products'), icon: IconPackage },
    { id: 'schedule', label: t('new.steps.schedule'), icon: IconCalendar },
    { id: 'review', label: t('new.steps.review'), icon: IconCheck }
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <Card>
      <CardContent className='flex items-center justify-center'>
        <div className='flex w-full max-w-3xl items-center justify-center'>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className='flex flex-1 items-center'>
                <div className='flex w-fit flex-1 flex-col items-center gap-2'>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                      isActive &&
                        'border-primary bg-primary text-primary-foreground',
                      isCompleted &&
                        'border-primary bg-primary text-primary-foreground',
                      !isActive &&
                        !isCompleted &&
                        'border-muted bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <IconCheck className='h-5 w-5' />
                    ) : (
                      <Icon className='h-5 w-5' />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-center text-sm font-medium',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-full max-w-[100px] transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
