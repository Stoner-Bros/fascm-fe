import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  IconBuilding,
  IconCalendar,
  IconMapPin,
  IconPackage,
  IconTruck
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { OrderSchedule } from '@/types/order';
import { formatDate } from '../../utils/formatting';

interface OrderInfoCardProps {
  orderSchedule: OrderSchedule;
  totalQuantity: number;
}

export function OrderInfoCard({
  orderSchedule,
  totalQuantity
}: OrderInfoCardProps) {
  const t = useTranslations('Orders');

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconPackage className='h-5 w-5' />
          {t('detail.overview.orderInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Order Information Section */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <IconPackage className='h-4 w-4' />
            {t('detail.overview.orderDetails')}
          </h3>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.orderNumber')}
              </p>
              <p className='font-medium'>
                {orderSchedule.order?.orderNumber || orderSchedule.id}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.totalQuantity')}
              </p>
              <p className='font-medium'>
                {totalQuantity}{' '}
                {orderSchedule.order?.unit || t('common.unit.kg')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.createdAt')}
              </p>
              <p className='text-sm font-medium'>
                {formatDate(orderSchedule.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Consignee Information Section */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <IconBuilding className='h-4 w-4' />
            {t('detail.overview.consigneeInformation')}
          </h3>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.organization')}
              </p>
              <p className='font-medium'>
                {orderSchedule.consignee?.organizationName ||
                  t('common.notSpecified')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.representative')}
              </p>
              <p className='font-medium'>
                {orderSchedule.consignee?.representativeName ||
                  t('common.notSpecified')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.contact')}
              </p>
              <p className='font-medium'>
                {orderSchedule.consignee?.contact || t('common.notSpecified')}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery Information Section */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <IconTruck className='h-4 w-4' />
            {t('detail.overview.deliveryInformation')}
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                <IconCalendar className='h-3 w-3' />
                {t('detail.overview.deliveryDate')}
              </p>
              <p className='font-medium'>
                {orderSchedule.deliveryDate
                  ? formatDate(orderSchedule.deliveryDate)
                  : t('detail.overview.notSpecified')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                <IconMapPin className='h-3 w-3' />
                {t('detail.overview.deliveryAddress')}
              </p>
              <p className='text-sm font-medium'>
                {orderSchedule.address || t('detail.overview.notSpecified')}
              </p>
            </div>
          </div>
          {orderSchedule?.description?.split(' --wh-- ')[0] && (
            <div className='mt-3'>
              <p className='text-muted-foreground mb-1 text-xs'>
                {t('detail.overview.description')}
              </p>
              <p className='bg-muted/50 rounded-md border p-3 text-sm'>
                {orderSchedule.description.split(' --wh-- ')[0]}
              </p>
            </div>
          )}
          {orderSchedule.reason && orderSchedule.status === 'rejected' && (
            <div className='mt-3'>
              <p className='text-destructive mb-1 text-xs font-semibold'>
                {t('detail.overview.rejectionReason')}
              </p>
              <p className='border-destructive bg-destructive/10 rounded-md border p-3 text-sm'>
                {orderSchedule.reason}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
