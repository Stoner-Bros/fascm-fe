import { Button } from '@/components/ui/button';
import type { OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderHeaderProps {
  schedule: OrderSchedule;
  status: OrderScheduleStatus | null | undefined;
  hasRemainingQuantity: boolean;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
  onCreatePhase: () => void;
  updating: boolean;
}

export function OrderHeader({
  schedule,
  status,
  hasRemainingQuantity,
  onApprove,
  onReject,
  onCreatePhase,
  onComplete,
  updating
}: OrderHeaderProps) {
  const router = useRouter();

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => router.back()}
          className='shrink-0'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold sm:text-3xl'>
            Chi tiết lịch giao hàng
          </h1>
          <p className='text-muted-foreground mt-1 text-sm sm:text-base'>
            Mã: {schedule.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {status === 'pending' && (
          <>
            <Button
              variant='destructive'
              onClick={onReject}
              disabled={updating}
              size='sm'
            >
              Từ chối
            </Button>
            <Button onClick={onApprove} disabled={updating} size='sm'>
              Duyệt
            </Button>
          </>
        )}
        {(status === 'approved' || status === 'processing') &&
          hasRemainingQuantity && (
            <Button onClick={onCreatePhase} size='sm'>
              Tạo đợt giao hàng
            </Button>
          )}
        {status === 'processing' && !hasRemainingQuantity && (
          <Button onClick={onComplete} size='sm'>
            <Check className='mr-2 h-4 w-4' />
            Đánh dấu hoàn thành
          </Button>
        )}
      </div>
    </div>
  );
}
