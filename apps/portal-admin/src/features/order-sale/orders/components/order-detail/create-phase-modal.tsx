import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OrderSchedule } from '@/types/order';
import type { OrderDetail } from '@/types/order-detail';
import { Calendar, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import type { PhaseFormData } from '../../hooks/order-detail/use-phase-form';
import type { ProductTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatting';
interface CreatePhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: OrderSchedule;
  totals: ProductTotals;
  phaseData: PhaseFormData;
  phaseNumber: number;
  onPhaseDataChange: (updates: Partial<PhaseFormData>) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onToggleSelection: (
    productId: string,
    selectionId: string,
    orderDetail: OrderDetail
  ) => void;
  onCreate: () => void;
  loading: boolean;
}

export function CreatePhaseDialog({
  open,
  onOpenChange,
  schedule,
  totals,
  phaseData,
  phaseNumber,
  onPhaseDataChange,
  onQuantityChange,
  onToggleSelection,
  onCreate,
  loading
}: CreatePhaseDialogProps) {
  // Calculate next phase number based on existing phases count
  const nextPhaseNumber = useMemo(() => {
    return phaseNumber;
  }, [phaseNumber]);

  // Sync phase number when it changes
  useEffect(() => {
    if (phaseData.phaseNumber !== nextPhaseNumber) {
      onPhaseDataChange({ phaseNumber: nextPhaseNumber });
    }
  }, [nextPhaseNumber, phaseData.phaseNumber, onPhaseDataChange]);

  // Calculate totals in real-time from selected selections
  const calculatedTotals = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;

    schedule.orderDetails?.forEach((orderDetail) => {
      const detail = phaseData.invoiceDetails.find(
        (d) => d.product.id === orderDetail.product?.id
      );
      if (detail && detail.selectionIds && detail.selectionIds.length > 0) {
        const selectedSelections =
          orderDetail.orderDetailSelections?.filter((sel) =>
            detail.selectionIds!.includes(sel.id)
          ) || [];
        selectedSelections.forEach((sel) => {
          subtotal += (sel.quantity || 0) * (sel.unitPrice || 0);
        });
        if (selectedSelections.length > 0) {
          itemCount++;
        }
      }
    });

    const taxAmount = subtotal * (phaseData.taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      itemCount
    };
  }, [phaseData.invoiceDetails, phaseData.taxRate, schedule.orderDetails]);

  const hasValidItems = calculatedTotals.itemCount > 0;
  const t = useTranslations('Orders.detail.createPhase');

  return (
    <Modal
      title={t('title')}
      description={t('descriptionHeader')}
      isOpen={open}
      onClose={() => onOpenChange(false)}
      footer={
        <>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onCreate} disabled={loading || !hasValidItems}>
            {loading ? t('creating') : t('create')}
          </Button>
        </>
      }
    >
      {/* Basic Information */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div>
          <Label htmlFor='phaseNumber' className='text-sm font-medium'>
            {t('phaseNumber')}
          </Label>
          <Input
            id='phaseNumber'
            type='number'
            value={nextPhaseNumber}
            className='mt-2'
            min={1}
            disabled
            readOnly
          />
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('phaseNumberHelper')}
          </p>
        </div>
        <div>
          <Label htmlFor='taxRate' className='text-sm font-medium'>
            {t('taxRate')}
          </Label>
          <Input
            id='taxRate'
            type='number'
            value={phaseData.taxRate}
            onChange={(e) =>
              onPhaseDataChange({
                taxRate: parseFloat(e.target.value) || 0
              })
            }
            onKeyDown={(e) => {
              // Prevent arrow keys from incrementing/decrementing the value
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
              }
            }}
            className='mt-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            min={0}
            max={100}
            step={0.1}
          />
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('taxRateHelper')}
          </p>
        </div>
        <div>
          <Label className='text-sm font-medium'>{t('totalAmount')}</Label>
          <div className='text-primary mt-2 text-2xl font-bold'>
            {formatCurrency(calculatedTotals.totalAmount)}
          </div>
          <p className='text-muted-foreground mt-1 text-xs'>
            {calculatedTotals.itemCount} {t('products')}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor='description' className='text-sm font-medium'>
          {t('description')}
        </Label>
        <Textarea
          id='description'
          value={phaseData.description}
          onChange={(e) => onPhaseDataChange({ description: e.target.value })}
          placeholder={t('descriptionPlaceholder')}
          rows={2}
          className='mt-2'
        />
      </div>

      {/* Products and Selections Cards */}
      <div className='space-y-4'>
        <div className='mb-4 flex items-center justify-between'>
          <Label className='text-base font-semibold'>
            {t('productsTitle')}
          </Label>
          <p className='text-muted-foreground text-sm'>{t('productsHelper')}</p>
        </div>
        <div className='space-y-4'>
          {schedule.orderDetails?.map((orderDetail) => {
            const productId = orderDetail.product?.id;
            if (!productId) return null;

            const detail = phaseData.invoiceDetails.find(
              (d) => d.product.id === productId
            );
            const selectedSelectionIds =
              phaseData.selectedSelections[productId] || [];
            const productTotals = totals[productId] || {
              name: orderDetail.product?.name || '',
              total: 0,
              used: 0
            };
            const remaining = productTotals.total - productTotals.used;

            // Calculate total quantity and amount for this product
            const selectedSelections =
              orderDetail.orderDetailSelections?.filter((sel) =>
                selectedSelectionIds.includes(sel.id)
              ) || [];
            const totalQuantity = selectedSelections.reduce(
              (sum, sel) => sum + (sel.quantity || 0),
              0
            );
            const totalAmount = selectedSelections.reduce(
              (sum, sel) => sum + (sel.quantity || 0) * (sel.unitPrice || 0),
              0
            );

            return (
              <Card
                key={`product-${productId}`}
                className='overflow-hidden transition-shadow hover:shadow-md'
              >
                <CardHeader className='bg-muted/30 border-b pb-3'>
                  <div className='flex items-start gap-4'>
                    {orderDetail.product?.image && (
                      <img
                        src={orderDetail.product.image}
                        alt={orderDetail.product.name || ''}
                        className='h-12 w-12 rounded-lg object-cover'
                      />
                    )}
                    <div className='flex-1'>
                      <CardTitle className='text-lg'>
                        {orderDetail.product?.name || '-'}
                      </CardTitle>
                      <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-4 text-sm'>
                        <span className='flex items-center gap-1'>
                          <Package className='h-3.5 w-3.5' />
                          Selected:{' '}
                          <strong className='text-foreground'>
                            {totalQuantity}
                          </strong>{' '}
                          {detail?.unit || orderDetail.unit || ''}
                        </span>
                        <span>
                          Remaining:{' '}
                          <strong className='text-foreground'>
                            {remaining}
                          </strong>
                        </span>
                        {totalAmount > 0 && (
                          <span className='text-primary ml-auto font-semibold'>
                            {formatCurrency(totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='space-y-2'>
                    {orderDetail.orderDetailSelections?.map((selection) => {
                      const isSelected = selectedSelectionIds.includes(
                        selection.id
                      );
                      const selectionAmount =
                        (selection.quantity || 0) * (selection.unitPrice || 0);

                      return (
                        <div
                          key={selection.id}
                          className={`group flex items-center gap-4 rounded-lg border p-4 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              onToggleSelection(
                                productId,
                                selection.id,
                                orderDetail
                              )
                            }
                            className='h-5 w-5'
                          />
                          <div className='flex flex-1 items-center justify-between gap-4'>
                            <div className='flex-1 space-y-1'>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                  {selection.batch?.batchCode || '-'}
                                </span>
                                {selection.batch?.expiredAt && (
                                  <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                                    <Calendar className='h-3 w-3' />
                                    {new Date(
                                      selection.batch.expiredAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                                <span>
                                  Quantity:{' '}
                                  <strong className='text-foreground'>
                                    {selection.quantity || 0}
                                  </strong>
                                </span>
                                <span>
                                  Unit:{' '}
                                  <strong className='text-foreground'>
                                    {selection.unit || orderDetail.unit || '-'}
                                  </strong>
                                </span>
                                <span>
                                  Unit Price:{' '}
                                  <strong className='text-foreground'>
                                    {formatCurrency(selection.unitPrice || 0)}
                                  </strong>
                                </span>
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='text-primary text-lg font-semibold'>
                                {formatCurrency(selectionAmount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!orderDetail.orderDetailSelections ||
                      orderDetail.orderDetailSelections.length === 0) && (
                      <div className='text-muted-foreground py-4 text-center text-sm'>
                        No selections available for this product
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary Card */}
      {hasValidItems && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>{t('summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('subtotal')}:</span>
              <span className='font-medium'>
                {formatCurrency(calculatedTotals.subtotal)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {t('vat')} ({phaseData.taxRate}%):
              </span>
              <span className='font-medium'>
                {formatCurrency(calculatedTotals.taxAmount)}
              </span>
            </div>
            <div className='border-primary/20 border-t pt-3'>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-semibold'>
                  {t('totalPayment')}:
                </span>
                <span className='text-primary text-2xl font-bold'>
                  {formatCurrency(calculatedTotals.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Message */}
      {!hasValidItems && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <p className='text-sm text-yellow-800'>
            <strong>{t('validation.title')}:</strong> {t('validation.message')}
          </p>
        </div>
      )}
    </Modal>
  );
}
