'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DeliveryStatusEnum } from '@/types/delivery';
import {
  Check,
  Circle,
  Clock,
  Loader2,
  PackageCheck,
  RotateCcw,
  Truck,
  X
} from 'lucide-react';

interface DeliveryStatusStepperProps {
  currentStatus: DeliveryStatusEnum | null | undefined;
  onStatusChange?: (status: DeliveryStatusEnum) => void;
  isLoading?: boolean;
  canUpdate?: boolean;
}

const statusSteps: Array<{
  status: DeliveryStatusEnum;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    status: 'scheduled',
    label: 'Đã lên lịch',
    icon: <Clock className='h-4 w-4' />,
    description: 'Chuyến giao đã được lên lịch'
  },
  {
    status: 'delivering',
    label: 'Đang tới nhà vườn',
    icon: <Truck className='h-4 w-4' />,
    description: 'Đang trên đường tới nhà vườn'
  },
  {
    status: 'delivered',
    label: 'Đã lấy hàng',
    icon: <PackageCheck className='h-4 w-4' />,
    description: 'Hàng đã được lấy thành công'
  },
  {
    status: 'returning',
    label: 'Đang về',
    icon: <RotateCcw className='h-4 w-4' />,
    description: 'Xe đang quay về kho'
  },
  {
    status: 'completed',
    label: 'Hoàn thành',
    icon: <Check className='h-4 w-4' />,
    description: 'Hoàn tất quy trình giao hàng'
  }
];

function getStatusIndex(status: DeliveryStatusEnum | null | undefined): number {
  if (!status) return -1;
  return statusSteps.findIndex((s) => s.status === status);
}

function getNextStatus(
  currentStatus: DeliveryStatusEnum | null | undefined
): DeliveryStatusEnum | null {
  const currentIndex = getStatusIndex(currentStatus);
  if (currentIndex === -1 || currentIndex >= statusSteps.length - 1)
    return null;
  return statusSteps[currentIndex + 1].status;
}

export function DeliveryStatusStepper({
  currentStatus,
  onStatusChange,
  isLoading = false,
  canUpdate = true
}: DeliveryStatusStepperProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const isCanceled = currentStatus === 'canceled';
  const isCompleted = currentStatus === 'completed';
  const nextStatus = getNextStatus(currentStatus);

  return (
    <div className='space-y-2'>
      {/* Stepper visualization */}
      <div className='relative'>
        {/* Progress line */}
        <div className='bg-muted absolute top-3 left-3 h-[calc(100%-24px)] w-0.5' />
        {!isCanceled && currentIndex >= 0 && (
          <div
            className='bg-primary absolute top-3 left-3 w-0.5 transition-all duration-500'
            style={{
              height: `calc(${(currentIndex / (statusSteps.length - 1)) * 100}% * (100% - 24px) / 100%)`
            }}
          />
        )}

        {/* Steps */}
        <div className='relative space-y-2'>
          {statusSteps.map((step, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div
                key={step.status}
                className={cn(
                  'flex items-center gap-2 transition-opacity',
                  isCanceled && 'opacity-50',
                  isFuture && !isCanceled && 'opacity-50'
                )}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                    isActive &&
                      'border-primary bg-primary text-primary-foreground',
                    isPast &&
                      'border-primary bg-primary text-primary-foreground',
                    isFuture &&
                      'border-muted bg-background text-muted-foreground',
                    isCanceled &&
                      'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isPast ? (
                    <Check className='h-3 w-3' />
                  ) : (
                    <span className='[&>svg]:h-3 [&>svg]:w-3'>{step.icon}</span>
                  )}
                </div>

                {/* Step content */}
                <p
                  className={cn(
                    'text-xs font-medium',
                    isActive && 'text-primary',
                    isFuture && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}

          {/* Canceled state */}
          {isCanceled && (
            <div className='flex items-center gap-2'>
              <div className='border-destructive bg-destructive text-destructive-foreground relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2'>
                <X className='h-3 w-3' />
              </div>
              <p className='text-destructive text-xs font-medium'>Đã hủy</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {canUpdate && !isCanceled && !isCompleted && onStatusChange && (
        <div className='flex items-center gap-1.5 pt-1'>
          {nextStatus && (
            <Button
              size='sm'
              onClick={() => onStatusChange(nextStatus)}
              disabled={isLoading}
              className='h-7 flex-1 text-xs'
            >
              {isLoading ? (
                <Loader2 className='mr-1 h-3 w-3 animate-spin' />
              ) : (
                <Circle className='mr-1 h-3 w-3' />
              )}
              {statusSteps.find((s) => s.status === nextStatus)?.label}
            </Button>
          )}

          {/* <Button
            variant='destructive'
            size='sm'
            onClick={() => onStatusChange('canceled')}
            disabled={isLoading}
            className='h-7 text-xs'
          >
            {isLoading ? (
              <Loader2 className='mr-1 h-3 w-3 animate-spin' />
            ) : (
              <X className='mr-1 h-3 w-3' />
            )}
            Hủy
          </Button> */}
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className='rounded-md bg-green-50 p-2 dark:bg-green-950/30'>
          <p className='text-xs font-medium text-green-700 dark:text-green-400'>
            Hoàn thành!
          </p>
        </div>
      )}

      {/* Canceled state */}
      {isCanceled && (
        <div className='rounded-md bg-red-50 p-2 dark:bg-red-950/30'>
          <p className='text-xs font-medium text-red-700 dark:text-red-400'>
            Đã hủy
          </p>
        </div>
      )}
    </div>
  );
}

// Simple status badge component
export function DeliveryStatusBadge({
  status
}: {
  status: DeliveryStatusEnum | null | undefined;
}) {
  const statusConfig: Record<
    DeliveryStatusEnum,
    { label: string; className: string }
  > = {
    scheduled: {
      label: 'Đã lên lịch',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    },
    delivering: {
      label: 'Đang giao',
      className:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    delivered: {
      label: 'Đã giao',
      className:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    },
    returning: {
      label: 'Đang về',
      className:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    },
    completed: {
      label: 'Hoàn thành',
      className:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    rejected: {
      label: 'Từ chối',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    },
    canceled: {
      label: 'Đã hủy',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  };

  if (!status) {
    return (
      <span className='inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
        N/A
      </span>
    );
  }

  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
