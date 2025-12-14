import { Card, CardContent } from '@/components/ui/card';
import { IconCheck, IconClock, IconTruck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { getOrderStatusBadge } from '../../utils/status-badge';

interface OrderStatusStepperProps {
  orderSchedule: OrderSchedule;
}

export function OrderStatusStepper({ orderSchedule }: OrderStatusStepperProps) {
  const t = useTranslations('Orders');

  const getOrderSteps = () => {
    const steps = [
      {
        key: 'pending',
        label: t('detail.statusSteps.pending'),
        icon: IconClock
      },
      {
        key: 'approved',
        label: t('detail.statusSteps.approved'),
        icon: IconCheck
      },
      {
        key: 'processing',
        label: t('detail.statusSteps.processing'),
        icon: IconTruck
      },
      {
        key: 'completed',
        label: t('detail.statusSteps.completed'),
        icon: IconCheck
      }
    ];

    const currentStatus = orderSchedule.status as OrderScheduleStatus;
    let currentStepIndex = 0;

    if (currentStatus === 'pending') currentStepIndex = 0;
    else if (currentStatus === 'approved') currentStepIndex = 1;
    else if (currentStatus === 'processing') currentStepIndex = 2;
    else if (currentStatus === 'completed') currentStepIndex = 3;
    else if (currentStatus === 'rejected' || currentStatus === 'canceled')
      currentStepIndex = -1; // Special case

    return { steps, currentStepIndex };
  };

  const { steps, currentStepIndex } = getOrderSteps();

  return (
    <Card>
      <CardContent>
        {orderSchedule.status === 'rejected' ||
        orderSchedule.status === 'canceled' ? (
          <div className='flex items-center justify-center gap-3 p-4'>
            <div className='px-4 py-2 text-base'>
              {getOrderStatusBadge(
                orderSchedule.status as OrderScheduleStatus,
                t
              )}
            </div>
            {orderSchedule.reason && (
              <p className='text-muted-foreground text-sm'>
                {t('common.separator')} {orderSchedule.reason}
              </p>
            )}
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
