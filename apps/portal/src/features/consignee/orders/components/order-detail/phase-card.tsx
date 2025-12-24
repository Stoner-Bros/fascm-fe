import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { OrderPhase, OrderSchedule } from '@/types/order';
import { IconFileInvoice, IconPackage, IconTruck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { formatCurrency, formatDate } from '../../utils/formatting';
import {
  getPhaseStatusBadge,
  getPhaseStatusIcon
} from '../../utils/status-badge';
import type { OrderPhaseStatus } from '@/types/order';

const DeliveryRouteSim = dynamic(
  () => import('@/components/map/delivery-route-sim'),
  { ssr: false }
);

interface PhaseCardProps {
  phase: OrderPhase;
  orderSchedule: OrderSchedule;
  onConfirmDelivery?: (phaseId: string) => void;
  isConfirming?: boolean;
}

export function PhaseCard({
  phase,
  orderSchedule,
  onConfirmDelivery,
  isConfirming
}: PhaseCardProps) {
  const t = useTranslations('Orders');
  const normalizedStatus = (() => {
    const raw = String(phase.status ?? '')
      .trim()
      .toLowerCase();
    const synonyms: Record<string, OrderPhaseStatus> = {
      deliverd: 'delivered',
      delivered: 'delivered',
      complete: 'completed',
      cancelled: 'canceled'
    };
    const mapped = synonyms[raw] ?? raw;
    const allowed: OrderPhaseStatus[] = [
      'preparing',
      'delivering',
      'delivered',
      'completed',
      'canceled'
    ];
    return (
      allowed.includes(mapped as OrderPhaseStatus) ? mapped : 'preparing'
    ) as OrderPhaseStatus;
  })();

  return (
    <Card key={phase.id}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            {getPhaseStatusIcon(normalizedStatus)}
            {t('detail.phases.phase')} {phase.phaseNumber}
          </CardTitle>
          <div className='flex gap-2'>
            {getPhaseStatusBadge(normalizedStatus, t)}
            {/* Confirm button */}
            {String(normalizedStatus) === 'delivered' && onConfirmDelivery && (
              <Button
                variant='default'
                onClick={() => onConfirmDelivery(phase.id)}
                disabled={isConfirming}
                className='h-7 text-xs'
              >
                {t('detail.phases.confirmDelivery')}
              </Button>
            )}
          </div>
        </div>
        {phase.description && (
          <CardDescription>{phase.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className='space-y-6'>
        {['delivering', 'delivered'].includes(String(normalizedStatus)) && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTruck className='h-5 w-5' />
                {t('detail.phases.trackingTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryRouteSim
                cargo={t('detail.phases.cargo', {
                  quantity:
                    phase.orderInvoice?.quantity ??
                    (phase.orderInvoiceDetails?.reduce(
                      (s, d) => s + (d.quantity ?? 0),
                      0
                    ) ||
                      0),
                  unit: phase.orderInvoice?.unit || t('common.unit.kg')
                })}
                startAddress={t('detail.phases.startAddressDefault')}
                endAddress={String(orderSchedule.address ?? '')}
                orderScheduleId={String(orderSchedule.id ?? '')}
                phaseId={phase.id}
                status={String(normalizedStatus)}
                productName={(phase.orderInvoiceDetails || [])
                  .map((d) => d.product?.name)
                  .filter(Boolean)
                  .join(', ')}
              />
            </CardContent>
          </Card>
        )}
        {/* Invoice Details (Products) */}
        {phase.orderInvoiceDetails && phase.orderInvoiceDetails.length > 0 && (
          <div className='space-y-3'>
            <h5 className='flex items-center gap-2 font-semibold'>
              <IconPackage className='h-4 w-4' />
              {t('detail.phases.itemsInPhase')}
            </h5>
            <div className='grid gap-3'>
              {phase.orderInvoiceDetails.map((detail) => (
                <div key={detail.id} className='rounded-lg border'>
                  {/* Product Header */}
                  <div className='bg-card bg-muted/30 flex items-center gap-4 border-b p-4'>
                    <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
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
                          <IconPackage className='text-muted-foreground h-6 w-6' />
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h6 className='text-base font-semibold'>
                        {detail.product?.name ||
                          t('detail.overview.unknownProduct')}
                      </h6>
                      <p className='text-muted-foreground text-sm'>
                        {t('detail.overview.productId')}:{' '}
                        {detail.product?.id || t('common.notSpecified')}
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        {t('detail.overview.quantity')}:{' '}
                        <strong className='text-foreground'>
                          {detail.quantity}
                        </strong>{' '}
                        {detail.unit}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-muted-foreground mb-1 text-xs'>
                        {t('detail.overview.amount')}
                      </p>
                      <p className='text-xl font-bold'>
                        {formatCurrency(detail.amount || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Selections */}
                  {detail.orderDetailSelections &&
                    detail.orderDetailSelections.length > 0 && (
                      <div className='divide-y'>
                        {detail.orderDetailSelections.map(
                          (selection, index) => (
                            <div
                              key={selection.id || index}
                              className='flex items-center justify-between px-4 py-3'
                            >
                              <div className='flex items-center gap-3'>
                                <span className='bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium'>
                                  {index + 1}
                                </span>
                                <div>
                                  <p className='text-sm font-medium'>
                                    {selection.batch?.batchCode ||
                                      `Lô hàng ${index + 1}`}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {t('detail.overview.quantity')}:{' '}
                                    <strong>{selection.quantity}</strong>{' '}
                                    {detail.unit}
                                  </p>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='text-sm'>
                                  {t('detail.overview.unitPrice')}:{' '}
                                  <strong>
                                    {formatCurrency(selection.unitPrice || 0)}
                                  </strong>
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                  {formatCurrency(
                                    (selection.quantity || 0) *
                                      (selection.unitPrice || 0)
                                  )}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Information - Highlighted */}
        {phase.orderInvoice && (
          <div className='border-primary/30 from-primary/5 to-primary/10 space-y-4 rounded-lg border-2 bg-gradient-to-br p-6 shadow-md'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-lg font-bold'>
                <IconFileInvoice className='text-primary h-6 w-6' />
                <span className='text-primary'>
                  {t('detail.phases.invoiceInformation')}
                </span>
              </div>
            </div>
            <Separator className='bg-primary/20' />
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div>
                <p className='text-muted-foreground mb-1 text-xs'>
                  {t('detail.phases.totalAmount')}
                </p>
                <p className='text-base font-semibold'>
                  {formatCurrency(phase.orderInvoice.totalAmount || 0)}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground mb-1 text-xs'>
                  {t('detail.phases.vat')} ({phase.orderInvoice.taxRate || 0}%)
                </p>
                <p className='text-base font-semibold'>
                  {formatCurrency(phase.orderInvoice.vatAmount || 0)}
                </p>
              </div>
              <div className='col-span-2 md:col-span-1'>
                <p className='text-muted-foreground mb-1 text-xs'>
                  {t('detail.phases.totalPayment')}
                </p>
                <p className='text-primary text-2xl font-bold'>
                  {formatCurrency(phase.orderInvoice.totalPayment || 0)}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground mb-1 text-xs'>
                  {t('detail.phases.quantity')}
                </p>
                <p className='text-base font-semibold'>
                  {phase.orderInvoice.quantity}{' '}
                  {phase.orderInvoice.unit || t('common.unit.kg')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Proofs */}
        {phase.imageProof && phase.imageProof.length > 0 && (
          <div className='space-y-3'>
            <h5 className='font-semibold'>{t('detail.phases.imageProofs')}</h5>
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
              {phase.imageProof.map((img) => (
                <div
                  key={img.id}
                  className='bg-muted relative aspect-square overflow-hidden rounded-md border'
                >
                  {img.photo.path && (
                    <img
                      src={img.photo.path}
                      alt={t('detail.phases.imageProof')}
                      className='object-cover transition-transform hover:scale-105'
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase Dates */}
        <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-sm'>
          <div>
            <span>{t('detail.phases.created')}: </span>
            <span className='text-foreground font-medium'>
              {formatDate(phase.createdAt)}
            </span>
          </div>
          <div>
            <span>{t('detail.phases.updated')}: </span>
            <span className='text-foreground font-medium'>
              {formatDate(phase.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
