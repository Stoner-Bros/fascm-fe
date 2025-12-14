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

interface HarvestDetailsTableProps {
  schedule: HarvestSchedule;
  totals?: ProductTotals;
}

export function HarvestDetailsTable({
  schedule,
  totals
}: HarvestDetailsTableProps) {
  const t = useTranslations('HarvestOrders.detail.detailsTable');
  const hasDetails =
    schedule.harvestDetails && schedule.harvestDetails.length > 0;

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
                <TableHead>{t('unitPrice')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                {totals && <TableHead>{t('received')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasDetails ? (
                schedule.harvestDetails!.map((detail) => {
                  const productId = detail.product?.id || '';
                  const productTotals = totals?.[productId];
                  const quantity = detail.quantity || 0;
                  const unitPrice = detail.unitPrice || 0;
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
    </Card>
  );
}
