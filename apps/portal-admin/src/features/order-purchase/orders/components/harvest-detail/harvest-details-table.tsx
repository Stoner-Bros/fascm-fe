import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../../utils/formatting';
import type { ProductTotals } from '../../utils/calculations';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePrice } from '@/services/harvest-detail.service';
import { useToast } from '@/components/ui/use-toast';

interface HarvestDetailsTableProps {
  schedule: HarvestSchedule;
  totals?: ProductTotals;
}

export function HarvestDetailsTable({
  schedule,
  totals
}: HarvestDetailsTableProps) {
  const t = useTranslations('HarvestOrders.detail.detailsTable');
  const tDialog = useTranslations('HarvestOrders.negotiationDialog');
  const { toast } = useToast();
  const hasDetails =
    schedule.harvestDetails && schedule.harvestDetails.length > 0;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (detail: any) => {
    setSelectedDetail(detail);
    setNegotiatedPrice('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDetail(null);
    setNegotiatedPrice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(negotiatedPrice);
    if (!price || price <= 0) {
      toast({
        title: tDialog('validation.priceRequired'),
        description: tDialog('validation.pricePositive'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePrice(selectedDetail.id, {
        finalUnitPrice: price
      });

      toast({
        title: tDialog('toast.success'),
        variant: 'default'
      });

      handleCloseDialog();
      // Optionally refresh the data here
      window.location.reload();
    } catch (error) {
      toast({
        title: tDialog('toast.error'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        {totals && (
          <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product')}</TableHead>
                <TableHead>{t('expectedQuantity')}</TableHead>
                <TableHead>{t('unit')}</TableHead>
                <TableHead>{t('currentUnitPrice')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                {totals && <TableHead>{t('received')}</TableHead>}
                {/* thương lượng giá trong tiếng anh  */}
                <TableHead>{t('negotiatedPrice')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasDetails ? (
                schedule.harvestDetails!.map((detail) => {
                  const productId = detail.product?.id || '';
                  const productTotals = totals?.[productId];
                  const quantity = detail.quantity || 0;
                  const unitPrice = detail.finalUnitPriceAccepted
                    ? detail.finalUnitPrice || 0
                    : detail.expectedUnitPrice || 0;
                  const amount = quantity * unitPrice;

                  return (
                    <TableRow key={detail.id}>
                      <TableCell className='font-medium'>
                        {detail.product?.name || '-'}
                      </TableCell>
                      <TableCell>{quantity}</TableCell>
                      <TableCell>{detail.unit || '-'}</TableCell>
                      <TableCell>{formatCurrency(unitPrice)}</TableCell>
                      <TableCell className='font-medium'>
                        {formatCurrency(amount)}
                      </TableCell>
                      {totals && (
                        <TableCell>
                          <span
                            className={
                              productTotals &&
                              productTotals.used >= productTotals.total
                                ? 'font-medium text-green-600'
                                : 'font-medium text-orange-600'
                            }
                          >
                            {productTotals?.used || 0} /{' '}
                            {productTotals?.total || 0}
                          </span>
                        </TableCell>
                      )}
                      <TableCell>
                        {detail.finalUnitPriceAccepted === null &&
                          // Chưa thương lượng thì hiện button bấm thương lượng
                          // Nếu đã thương lượng rồi thì hiện chữ đang chơ chấp thuận
                          (detail.finalUnitPrice ? (
                            <div className='flex w-fit flex-col items-center gap-2'>
                              {t('waitingNegotiation')}
                              <Button
                                variant='outline'
                                size='sm'
                                className='w-fit'
                                onClick={() => handleOpenDialog(detail)}
                              >
                                {t('makeNegotiationAgain')}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleOpenDialog(detail)}
                            >
                              {t('makeNegotiation')}
                            </Button>
                          ))}
                        {detail.finalUnitPriceAccepted === true && (
                          <span className='font-medium text-green-600'>
                            {t('negotiated')}
                          </span>
                        )}
                        {detail.finalUnitPriceAccepted === false && (
                          <div className='flex w-fit flex-col items-center gap-2'>
                            <span className='font-medium text-red-600'>
                              {t('negotiationRejected')}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              className='w-fit'
                              onClick={() => handleOpenDialog(detail)}
                            >
                              {t('makeNegotiationAgain')}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={totals ? 6 : 5}
                    className='text-muted-foreground py-8 text-center'
                  >
                    {t('empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{tDialog('title')}</DialogTitle>
            <DialogDescription>{tDialog('description')}</DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <form onSubmit={handleSubmit}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label className='text-muted-foreground text-sm'>
                    {tDialog('product')}
                  </Label>
                  <div className='font-medium'>
                    {selectedDetail.product?.name || '-'}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label className='text-muted-foreground text-sm'>
                      {tDialog('quantity')}
                    </Label>
                    <div className='font-medium'>{selectedDetail.quantity}</div>
                  </div>
                  <div className='grid gap-2'>
                    <Label className='text-muted-foreground text-sm'>
                      {tDialog('unit')}
                    </Label>
                    <div className='font-medium'>
                      {selectedDetail.unit || '-'}
                    </div>
                  </div>
                </div>

                <div className='grid gap-2'>
                  <Label className='text-muted-foreground text-sm'>
                    {tDialog('expectedPrice')}
                  </Label>
                  <div className='bg-muted/50 rounded-md border p-3 font-medium'>
                    {formatCurrency(selectedDetail.expectedUnitPrice || 0)}
                  </div>
                </div>

                {selectedDetail.finalUnitPrice && (
                  <div className='grid gap-2'>
                    <Label className='text-muted-foreground text-sm'>
                      {tDialog('negotiatedPriceCurrent')}
                    </Label>
                    <div className='bg-muted/50 rounded-md border p-3 font-medium'>
                      {formatCurrency(selectedDetail.finalUnitPrice || 0)}
                    </div>
                  </div>
                )}

                <div className='grid gap-2'>
                  <Label htmlFor='negotiatedPrice'>
                    {tDialog('negotiatedPrice')}{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='negotiatedPrice'
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder={tDialog('negotiatedPricePlaceholder')}
                    value={negotiatedPrice}
                    onChange={(e) => setNegotiatedPrice(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent arrow keys from incrementing/decrementing the value
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    required
                    disabled={isSubmitting}
                    className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  {tDialog('cancel')}
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? tDialog('submitting') : tDialog('submit')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
