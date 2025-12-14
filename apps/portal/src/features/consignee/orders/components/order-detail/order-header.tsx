import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { OrderSchedule } from '@/types/order';

interface OrderHeaderProps {
  orderSchedule: OrderSchedule;
}

export function OrderHeader({ orderSchedule }: OrderHeaderProps) {
  const router = useRouter();
  const t = useTranslations('Orders');

  return (
    <div className='flex items-center justify-between'>
      <div>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/consignee/orders')}
          >
            <IconArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              {t('detail.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('detail.orderId')}: {orderSchedule.id}
            </p>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {orderSchedule.status === 'pending' && (
          <Button
            variant='outline'
            onClick={() =>
              router.push(`/consignee/orders/${orderSchedule.id}/edit`)
            }
          >
            <IconEdit className='mr-2 h-4 w-4' />
            {t('detail.editOrder')}
          </Button>
        )}
      </div>
    </div>
  );
}
