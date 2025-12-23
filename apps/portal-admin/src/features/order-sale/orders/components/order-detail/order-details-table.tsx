import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../../utils/formatting';
import type { ProductTotals } from '../../utils/calculations';

interface OrderDetailsTableProps {
  schedule: OrderSchedule;
  totals?: ProductTotals;
}

export function OrderDetailsTable({
  schedule,
  totals
}: OrderDetailsTableProps) {
  const t = useTranslations('Orders.detail.detailsTable');
  const hasDetails = schedule.orderDetails && schedule.orderDetails.length > 0;

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
                <TableHead>{t('quantity')}</TableHead>
                <TableHead>{t('unit')}</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>{t('amount')}</TableHead>
                {totals && <TableHead>{t('delivered')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasDetails ? (
                schedule.orderDetails!.flatMap((detail) => {
                  const productId = detail.product?.id || '';
                  const productTotals = totals?.[productId];
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
                      <TableCell className='font-medium'>{quantity}</TableCell>
                      <TableCell>{detail.unit || '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className='font-semibold'>
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
                          {totals && <TableCell>-</TableCell>}
                        </TableRow>
                      ))
                    : [];

                  return [productRow, ...selectionRows];
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
    </Card>
  );
}
