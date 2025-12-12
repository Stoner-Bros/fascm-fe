import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { formatDateTime } from '../../utils/formatting';
import { getOrderStatusBadge } from '../../utils/status-badges';

interface OrderInfoCardProps {
  schedule: OrderSchedule;
}

export function OrderInfoCard({ schedule }: OrderInfoCardProps) {
  const t = useTranslations('Orders.detail.infoCard');
  const tStatus = useTranslations('Orders.list.statuses');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('status')}
            </Label>
            <div className='mt-2'>
              {getOrderStatusBadge(schedule.status, (key) => tStatus(key))}
            </div>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('deliveryDate')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.deliveryDate)}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('customer')}
            </Label>
            <p className='mt-2 font-medium'>
              {schedule.consignee?.organizationName || '-'}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('deliveryAddress')}
            </Label>
            <p className='mt-2 font-medium'>{schedule.address || '-'}</p>
          </div>
        </div>
        {schedule.description && (
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('description')}
            </Label>
            <p className='mt-2'>{schedule.description}</p>
          </div>
        )}
        {schedule.reason && (
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('rejectionReason')}
            </Label>
            <p className='text-destructive mt-2'>{schedule.reason}</p>
          </div>
        )}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('createdAt')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.createdAt)}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('updatedAt')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
