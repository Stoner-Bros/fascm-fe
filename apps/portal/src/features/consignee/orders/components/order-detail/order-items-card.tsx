import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { OrderSchedule } from '@/types/order';
import { formatCurrency } from '../../utils/formatting';

interface OrderItemsCardProps {
  orderSchedule: OrderSchedule;
  totalAmount: number;
}

export function OrderItemsCard({
  orderSchedule,
  totalAmount
}: OrderItemsCardProps) {
  const t = useTranslations('Orders');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.overview.orderItems')}</CardTitle>
        <CardDescription>
          {orderSchedule.orderDetails?.length || 0}{' '}
          {t('detail.overview.itemsInOrder')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {orderSchedule.orderDetails?.map((detail) => (
            <div
              key={detail.id}
              className='flex items-center gap-4 rounded-lg border p-4'
            >
              <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                {detail.product?.image ? (
                  <Image
                    src={detail.product.image}
                    alt={
                      detail.product?.name ||
                      t('detail.overview.unknownProduct')
                    }
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <IconPackage className='text-muted-foreground h-8 w-8' />
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold'>
                  {detail.product?.name || t('detail.overview.unknownProduct')}
                </h4>
                <p className='text-muted-foreground text-sm'>
                  {t('detail.overview.productId')}:{' '}
                  {detail.product?.id || t('common.notSpecified')}
                </p>
                <div className='mt-2 flex items-center gap-4 text-sm'>
                  <span>
                    {t('detail.overview.quantity')}:{' '}
                    <strong>{detail.quantity}</strong> {detail.unit}
                  </span>
                  <span>
                    {t('detail.overview.unitPrice')}:{' '}
                    <strong>{formatCurrency(detail.unitPrice || 0)}</strong>
                  </span>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-muted-foreground text-sm'>
                  {t('detail.overview.amount')}
                </p>
                <p className='text-lg font-bold'>
                  {formatCurrency(detail.amount || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className='my-4' />

        <div className='flex justify-end'>
          <div className='space-y-2'>
            <div className='flex justify-between gap-8'>
              <span className='text-muted-foreground'>
                {t('detail.overview.subtotal')}:
              </span>
              <span className='font-medium'>{formatCurrency(totalAmount)}</span>
            </div>
            <div className='flex justify-between gap-8'>
              <span className='text-lg font-bold'>
                {t('detail.overview.total')}:
              </span>
              <span className='text-lg font-bold'>
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
