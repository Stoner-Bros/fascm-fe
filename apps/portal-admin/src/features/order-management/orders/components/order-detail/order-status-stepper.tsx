import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { OrderScheduleStatus } from '@/types/order';
import { Check, Clock, Truck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OrderStatusStepperProps {
  status: OrderScheduleStatus | null | undefined;
  reason?: string | null;
}

export function OrderStatusStepper({
  status,
  reason
}: OrderStatusStepperProps) {
  const t = useTranslations('Orders.detail.statusStepper');
  const currentStatus = status as OrderScheduleStatus;

  const steps = [
    {
      key: 'pending' as const,
      label: t('pending'),
      icon: Clock
    },
    {
      key: 'approved' as const,
      label: t('approved'),
      icon: Check
    },
    {
      key: 'processing' as const,
      label: t('processing'),
      icon: Truck
    },
    {
      key: 'completed' as const,
      label: t('completed'),
      icon: Check
    }
  ];
  let currentStepIndex = 0;

  if (currentStatus === 'pending') currentStepIndex = 0;
  else if (currentStatus === 'approved') currentStepIndex = 1;
  else if (currentStatus === 'processing') currentStepIndex = 2;
  else if (currentStatus === 'completed') currentStepIndex = 3;
  else if (currentStatus === 'rejected' || currentStatus === 'canceled')
    currentStepIndex = -1; // Special case

  // Handle rejected/canceled status
  if (currentStatus === 'rejected' || currentStatus === 'canceled') {
    return (
      <Card>
        <CardContent>
          <div className='flex items-center justify-center gap-3 p-4'>
            <Badge
              variant='destructive'
              className='flex items-center gap-2 px-4 py-2 text-base'
            >
              <X className='h-4 w-4' />
              {currentStatus === 'rejected' ? t('rejected') : t('canceled')}
            </Badge>
            {reason && (
              <p className='text-muted-foreground text-sm'>- {reason}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className='flex flex-1 items-center'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted || isCurrent
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                    }`}
                  >
                    <StepIcon className='h-6 w-6' />
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isCompleted || isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={`mx-2 h-[2px] flex-1 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
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
