import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import type { PhaseFormData } from '../../hooks/harvest-detail/use-phase-form';
import type { ProductTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatting';

interface CreatePhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: HarvestSchedule;
  totals: ProductTotals;
  phaseData: PhaseFormData;
  phaseNumber: number;
  onPhaseDataChange: (updates: Partial<PhaseFormData>) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
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

  // Calculate totals in real-time
  const calculatedTotals = useMemo(() => {
    const validDetails = phaseData.invoiceDetails.filter(
      (d) => d.quantity && d.quantity > 0
    );

    const subtotal = validDetails.reduce((sum, detail) => {
      return sum + (detail.quantity || 0) * (detail.unitPrice || 0);
    }, 0);

    const taxAmount = subtotal * (phaseData.taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      itemCount: validDetails.length
    };
  }, [phaseData.invoiceDetails, phaseData.taxRate]);

  const handleQuantityChange = (
    productId: string,
    currentQuantity: number,
    delta: number,
    max: number
  ) => {
    const newQuantity = Math.max(0, Math.min(max, currentQuantity + delta));
    onQuantityChange(productId, newQuantity);
  };

  const hasValidItems = calculatedTotals.itemCount > 0;
  const t = useTranslations('HarvestOrders.detail.createPhase');

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
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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

      {/* Products Table */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <Label className='text-base font-semibold'>
            {t('productsTitle')}
          </Label>
          <p className='text-muted-foreground text-sm'>{t('productsHelper')}</p>
        </div>
        <div className='w-full rounded-lg border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[250px]'>{t('product')}</TableHead>
                <TableHead className='text-center'>{t('remaining')}</TableHead>
                <TableHead className='w-[180px] text-center'>
                  {t('receiveQuantity')}
                </TableHead>
                <TableHead className='text-center'>{t('unit')}</TableHead>
                <TableHead className='text-right'>{t('unitPrice')}</TableHead>
                <TableHead className='text-right'>{t('amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phaseData.invoiceDetails.map((detail, index) => {
                const product = schedule.harvestDetails?.find(
                  (d) => d.product?.id === detail.product.id
                );
                const productId = detail.product.id;
                const productTotals = totals[productId];
                const remaining = productTotals
                  ? productTotals.total - productTotals.used
                  : 0;
                const quantity = detail.quantity ?? 0;
                const unitPrice = detail.unitPrice ?? 0;
                const amount = quantity * unitPrice;
                const hasRemaining = remaining > 0;

                return (
                  <TableRow
                    key={index}
                    className={
                      !hasRemaining
                        ? 'bg-muted/30 opacity-60'
                        : quantity > 0
                          ? 'bg-primary/5'
                          : ''
                    }
                  >
                    <TableCell className='font-medium'>
                      <div>
                        <div>{product?.product?.name || '-'}</div>
                        {product?.product?.id && (
                          <div className='text-muted-foreground text-xs'>
                            ID: {product.product.id.slice(0, 8)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-center'>
                      <span
                        className={`font-medium ${
                          hasRemaining
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {remaining}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            handleQuantityChange(
                              detail.product.id,
                              quantity,
                              -1,
                              remaining
                            )
                          }
                          disabled={!hasRemaining || quantity <= 0}
                        >
                          <Minus className='h-4 w-4' />
                        </Button>
                        <Input
                          type='number'
                          min={0}
                          max={remaining}
                          value={quantity}
                          onChange={(e) =>
                            onQuantityChange(
                              detail.product.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='h-8 w-20 text-center'
                          disabled={!hasRemaining}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            handleQuantityChange(
                              detail.product.id,
                              quantity,
                              1,
                              remaining
                            )
                          }
                          disabled={!hasRemaining || quantity >= remaining}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                      {quantity > remaining && (
                        <p className='text-destructive mt-1 text-xs'>
                          {t('exceedsRemaining')}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      {detail.unit || '-'}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(unitPrice)}
                    </TableCell>
                    <TableCell className='text-right font-semibold'>
                      {quantity > 0 ? (
                        <span className='text-primary'>
                          {formatCurrency(amount)}
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
              <span className='text-lg font-semibold'>
                {t('totalPayment')}:
              </span>
              <span className='text-primary text-2xl font-bold'>
                {formatCurrency(calculatedTotals.totalAmount)}
              </span>
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
