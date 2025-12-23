import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { OrderPhase } from '@/types/order';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../../utils/formatting';
import { getPhaseStatusBadge } from '../../utils/status-badges';

interface PhaseCardProps {
  phase: OrderPhase;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const t = useTranslations('Orders.detail.phases');
  const subtotal =
    phase.orderInvoiceDetails?.reduce((sum, d) => sum + (d.amount || 0), 0) ||
    0;

  const taxAmount =
    phase.orderInvoice?.taxRate != null
      ? subtotal * (phase.orderInvoice.taxRate / 100)
      : 0;

  return (
    <Card className='border-l-primary border-l-4'>
      <CardHeader>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle className='text-lg'>
              {t('phase')} {phase.phaseNumber}:{' '}
              {phase.description || t('noDescription')}
            </CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            {getPhaseStatusBadge(phase.status, (key) =>
              t(`statuses.${key}` as any)
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product')}</TableHead>
                <TableHead>{t('quantity')}</TableHead>
                <TableHead>{t('unit')}</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>{t('amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phase.orderInvoiceDetails &&
              phase.orderInvoiceDetails.length > 0 ? (
                <>
                  {phase.orderInvoiceDetails.flatMap((detail) => {
                    const quantity = detail.quantity || 0;
                    const amount = detail.amount || 0;
                    const selections = detail.orderDetailSelections || [];
                    const hasSelections = selections.length > 0;

                    // Product header row
                    const productRow = (
                      <TableRow
                        key={detail.id}
                        className='bg-muted/30 hover:bg-muted/50'
                      >
                        <TableCell className='font-semibold'>
                          {detail.product?.name || '-'}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {quantity}
                        </TableCell>
                        <TableCell>{detail.unit || '-'}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className='font-semibold'>
                          {formatCurrency(amount)}
                        </TableCell>
                      </TableRow>
                    );

                    // Selection rows
                    const selectionRows = hasSelections
                      ? selections.map((selection, index) => (
                          <TableRow
                            key={`${detail.id}-selection-${selection.id || index}`}
                            className='bg-background'
                          >
                            <TableCell className='text-muted-foreground pl-8 text-sm'>
                              <span className='bg-primary/10 text-primary mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs'>
                                {index + 1}
                              </span>
                              {selection.batch?.batchCode ||
                                `Lô hàng ${index + 1}`}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {selection.quantity || 0}
                            </TableCell>
                            <TableCell className='text-muted-foreground text-sm'>
                              {detail.unit || '-'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatCurrency(selection.unitPrice || 0)}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatCurrency(
                                (selection.quantity || 0) *
                                  (selection.unitPrice || 0)
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      : [];

                    return [productRow, ...selectionRows];
                  })}
                  {phase.orderInvoice?.taxRate != null && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-muted-foreground text-right text-sm'
                      >
                        {t('tax')} ({phase.orderInvoice.taxRate}%):
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm font-medium'>
                        {formatCurrency(taxAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className='text-right font-semibold'>
                      {t('total')}:
                    </TableCell>
                    <TableCell className='text-lg font-semibold'>
                      {formatCurrency(
                        phase.orderInvoice?.totalPayment || subtotal + taxAmount
                      )}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
    </Card>
  );
}
