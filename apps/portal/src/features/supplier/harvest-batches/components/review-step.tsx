'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  IconCheck,
  IconCalendar,
  IconMapPin,
  IconPackage
} from '@tabler/icons-react';
import type { Product } from '@/services/product.service';
import type { HarvestDetail } from '../types';
import { formatCurrency } from '../hooks/use-create-harvest-schedule';

type ReviewStepProps = {
  products: Product[];
  harvestDetails: HarvestDetail[];
  harvestDate: string;
  harvestAddress: string;
  description: string;
  calculateTotal: () => number;
  calculateTotalQuantity: () => number;
  t: (key: string) => string;
};

export function ReviewStep({
  products,
  harvestDetails,
  harvestDate,
  harvestAddress,
  description,
  calculateTotal,
  calculateTotalQuantity,
  t
}: ReviewStepProps) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconCheck className='h-5 w-5' />
            {t('new.review.title')}
          </CardTitle>
          <CardDescription>{t('new.review.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Products */}
          <div>
            <h4 className='mb-3 font-semibold'>
              {t('new.review.selectedProducts')}
            </h4>
            <div className='space-y-3'>
              {harvestDetails.map((detail) => {
                const product = products.find((p) => p.id === detail.productId);
                if (!product) return null;

                return (
                  <div
                    key={detail.productId}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      {product.image ? (
                        <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md'>
                          <Image
                            src={product.image}
                            alt={product.name || 'Product'}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md'>
                          <IconPackage className='text-muted-foreground h-5 w-5' />
                        </div>
                      )}
                      <div>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-muted-foreground text-sm'>
                          {detail.quantity} {detail.unit} ×{' '}
                          {formatCurrency(detail.expectedUnitPrice || 0)}
                        </p>
                      </div>
                    </div>
                    <p className='text-primary font-semibold'>
                      {formatCurrency(
                        (detail.quantity || 0) * (detail.expectedUnitPrice || 0)
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Schedule info */}
          <div>
            <h4 className='mb-3 font-semibold'>
              {t('new.review.harvestInfo')}
            </h4>
            <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
              <div className='flex items-start gap-2'>
                <IconCalendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                <div>
                  <p className='text-muted-foreground text-xs'>
                    {t('new.schedule.harvestDate')}
                  </p>
                  <p className='font-medium'>
                    {new Date(harvestDate).toLocaleString('vi-VN', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <IconMapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                <div>
                  <p className='text-muted-foreground text-xs'>
                    {t('new.schedule.harvestAddress')}
                  </p>
                  <p className='font-medium'>{harvestAddress}</p>
                </div>
              </div>
              {description && (
                <div className='flex items-start gap-2'>
                  <IconPackage className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div>
                    <p className='text-muted-foreground text-xs'>
                      {t('new.schedule.notes')}
                    </p>
                    <p className='font-medium'>{description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className='bg-primary/5 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <span className='text-xl font-semibold'>
                  {t('new.review.totalAmount')}:
                </span>
                <p className='text-muted-foreground text-sm'>
                  {t('new.review.totalQuantity')}: {calculateTotalQuantity()} kg
                </p>
              </div>
              <span className='text-primary text-3xl font-bold'>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
