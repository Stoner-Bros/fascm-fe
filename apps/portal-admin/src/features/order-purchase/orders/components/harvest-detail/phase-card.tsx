import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { HarvestPhase } from '@/types/harvest-phase';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../../utils/formatting';
import { getPhaseStatusBadge } from '../../utils/status-badges';
import { Button } from '@/components/ui/button';
import { usePhaseActions } from '../../hooks/harvest-detail/use-harvest-detail';

interface PhaseCardProps {
  phase: HarvestPhase;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const t = useTranslations('HarvestOrders.detail.phases');
  const { confirmDelivery, updatingPhaseId } = usePhaseActions(() => {
    phase.status = 'completed';
  });
  const subtotal =
    phase.harvestInvoiceDetails?.reduce(
      (sum, d) => sum + (d.quantity || 0) * (d.unitPrice || 0),
      0
    ) || 0;

  return (
    <Card className='border-l-primary border-l-4'>
      <CardHeader>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle className='text-lg'>
              {t('phase')} {phase.phaseNumber}:{' '}
              {phase.description || t('noDescription')}
            </CardTitle>
            {phase.harvestInvoice?.invoiceNumber && (
              <p className='text-muted-foreground mt-1 text-sm'>
                {t('invoiceNumber')}: {phase.harvestInvoice.invoiceNumber}
              </p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {getPhaseStatusBadge(phase.status, (key) =>
              t(`statuses.${key}` as any)
            )}
            {phase.status === 'delivered' && (
              <Button
                variant='default'
                onClick={() => {
                  confirmDelivery(phase.id);
                }}
                disabled={updatingPhaseId === phase.id}
                className='h-7 text-xs'
              >
                Xác nhận đã nhận hàng
              </Button>
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
                <TableHead>{t('unitPrice')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phase.harvestInvoiceDetails &&
              phase.harvestInvoiceDetails.length > 0 ? (
                <>
                  {phase.harvestInvoiceDetails.map((detail) => {
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
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={4} className='text-right font-semibold'>
                      {t('total')}:
                    </TableCell>
                    <TableCell className='text-lg font-semibold'>
                      {formatCurrency(
                        phase.harvestInvoice?.totalPayment || subtotal
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
