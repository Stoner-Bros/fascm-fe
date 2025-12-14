'use client';

import { Button } from '@/components/ui/button';
import {
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconCheck
} from '@tabler/icons-react';
import type { Step } from '../types';

type StepNavigationProps = {
  currentStep: Step;
  submitting: boolean;
  canProceedToSchedule: boolean;
  canProceedToReview: boolean;
  onBack: () => void;
  onSetStep: (step: Step) => void;
  onSubmit: () => void;
  t: (key: string) => string;
};

export function StepNavigation({
  currentStep,
  submitting,
  canProceedToSchedule,
  canProceedToReview,
  onBack,
  onSetStep,
  onSubmit,
  t
}: StepNavigationProps) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <Button variant='outline' onClick={onBack} disabled={submitting}>
        <IconArrowLeft className='mr-2 h-4 w-4' />
        {currentStep === 'products'
          ? t('new.buttons.cancel')
          : t('new.buttons.previous')}
      </Button>

      <div className='flex gap-3'>
        {currentStep === 'products' && (
          <Button
            onClick={() => onSetStep('schedule')}
            disabled={!canProceedToSchedule}
          >
            {t('new.buttons.next')}
            <IconArrowRight className='ml-2 h-4 w-4' />
          </Button>
        )}

        {currentStep === 'schedule' && (
          <Button
            onClick={() => onSetStep('review')}
            disabled={!canProceedToReview}
          >
            {t('new.buttons.next')}
            <IconArrowRight className='ml-2 h-4 w-4' />
          </Button>
        )}

        {currentStep === 'review' && (
          <Button onClick={onSubmit} disabled={submitting} size='lg'>
            {submitting ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('new.buttons.submitting')}
              </>
            ) : (
              <>
                <IconCheck className='mr-2 h-4 w-4' />
                {t('new.buttons.submit')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
