'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Debt } from '@/types/debt';
import {
  IconAlertCircle,
  IconCalendar,
  IconCurrencyDong,
  IconCheck,
  IconClock,
  IconPercentage,
  IconReceipt,
  IconTrendingUp,
  IconWallet
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import {
  getAvailableCredit,
  getCreditUsagePercentage,
  getDaysUntilDue,
  getPaymentProgressPercentage,
  isCreditLimitNearExhaustion,
  isDebtDueSoon,
  isDebtOverdue
} from '../utils';
import { formatCurrency, formatDate } from '../utils/formatting';

interface DebtCardProps {
  debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
  const t = useTranslations('Debt');

  const getStatusBadge = () => {
    switch (debt.status) {
      case 'paid':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          >
            <IconCheck className='mr-1 h-3 w-3' />
            {t('status.paid')}
          </Badge>
        );
      case 'partially_paid':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          >
            <IconClock className='mr-1 h-3 w-3' />
            {t('status.partiallyPaid')}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          >
            <IconAlertCircle className='mr-1 h-3 w-3' />
            {t('status.overdue')}
          </Badge>
        );
      default:
        return (
          <Badge
            variant='outline'
            className='bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          >
            <IconClock className='mr-1 h-3 w-3' />
            {t('status.unpaid')}
          </Badge>
        );
    }
  };

  const getDebtTypeLabel = () => {
    return debt.debtType === 'receivable'
      ? t('debtType.receivable')
      : t('debtType.payable');
  };

  const days = getDaysUntilDue(debt.dueDate);
  const isOverdueValue = isDebtOverdue(debt);
  const isDueSoon = isDebtDueSoon(debt);

  const creditUsagePercentage = getCreditUsagePercentage(debt);
  const availableCredit = getAvailableCredit(debt);
  const paymentPercentage = getPaymentProgressPercentage(debt);

  const getCardBorderColor = () => {
    switch (debt.status) {
      case 'paid':
        return 'border-green-200 dark:border-green-900';
      case 'overdue':
        return 'border-red-200 dark:border-red-900';
      case 'partially_paid':
        return 'border-yellow-200 dark:border-yellow-900';
      default:
        return 'border-orange-200 dark:border-orange-900';
    }
  };

  return (
    <Card
      className={cn('transition-all hover:shadow-lg', getCardBorderColor())}
    >
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-lg p-2'>
              <IconReceipt className='text-primary h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg'>{t('card.debtInfo')}</CardTitle>
              <p className='text-muted-foreground text-xs font-normal'>
                {t('card.debtCode')}: {debt.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          {Boolean(debt.remainingAmount) && getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Highlight Section - Số tiền hệ thống nợ */}
        {Boolean(debt.remainingAmount) && (
          <div className='rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100/50 p-6 dark:border-green-800 dark:from-green-950/30 dark:to-green-900/20'>
            <div className='flex flex-col items-center justify-center text-center md:flex-row md:justify-between md:text-left'>
              <div className='mb-4 md:mb-0'>
                <p className='text-muted-foreground mb-2 text-sm font-medium'>
                  {t('card.systemOwes')}
                </p>
                <p className='text-4xl font-bold text-green-600 dark:text-green-400'>
                  {formatCurrency(debt.remainingAmount)}
                </p>
                <p className='text-muted-foreground mt-2 text-xs'>
                  {t('card.totalDebtValue')}:{' '}
                  {formatCurrency(debt.originalAmount)}
                </p>
              </div>
              {days >= 0 && (
                <div className='flex flex-col gap-3'>
                  <p className='text-muted-foreground text-center text-xs'>
                    {t('card.daysUntilSettlement', { days })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debt Overview Section */}
        <div className='bg-muted/30 rounded-lg border p-4'>
          <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
            <IconCurrencyDong className='h-4 w-4' />
            {t('card.debtOverview')}
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Original Amount */}
            <div className='bg-background rounded-lg p-4 shadow-sm'>
              <div className='mb-2 flex items-center gap-2'>
                <IconWallet className='text-muted-foreground h-4 w-4' />
                <p className='text-muted-foreground text-xs font-medium'>
                  {t('card.totalDebtValue')}
                </p>
              </div>
              <p className='text-xl font-bold'>
                {formatCurrency(debt.originalAmount ?? 0)}
              </p>
            </div>

            {/* Paid Amount */}
            <div className='rounded-lg bg-green-50 p-4 dark:bg-green-950/20'>
              <div className='mb-2 flex items-center gap-2'>
                <IconCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
                <p className='text-muted-foreground text-xs font-medium'>
                  {t('card.systemPaid')}
                </p>
              </div>
              <p className='text-xl font-bold text-green-600 dark:text-green-400'>
                {formatCurrency(debt.paidAmount)}
              </p>
              <div className='mt-2 flex items-center gap-1'>
                <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-green-200 dark:bg-green-900/50'>
                  <div
                    className='h-full bg-green-500 transition-all'
                    style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                  />
                </div>
                <span className='text-xs font-medium text-green-700 dark:text-green-300'>
                  {paymentPercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Remaining Amount */}
            <div className='rounded-lg bg-green-50 p-4 dark:bg-green-950/20'>
              <div className='mb-2 flex items-center gap-2'>
                <IconWallet className='h-4 w-4 text-green-600 dark:text-green-400' />
                <p className='text-muted-foreground text-xs font-medium'>
                  {t('card.systemStillOwes')}
                </p>
              </div>
              <p className='text-xl font-bold text-green-600 dark:text-green-400'>
                {formatCurrency(debt.remainingAmount)}
              </p>
              <div className='mt-2'>
                <Badge
                  variant='outline'
                  className='border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                >
                  {getDebtTypeLabel()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Credit Limit Section */}
        {Boolean(debt.creditLimit) && (
          <div className='rounded-lg border bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 dark:from-purple-950/20 dark:to-blue-950/20'>
            <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
              <IconTrendingUp className='h-4 w-4' />
              {t('card.creditLimit')}
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                <div className='bg-background rounded-lg p-3 shadow-sm'>
                  <p className='text-muted-foreground mb-1 text-xs font-medium'>
                    {t('card.limit')}
                  </p>
                  <p className='text-lg font-bold'>
                    {formatCurrency(debt.creditLimit)}
                  </p>
                </div>
                <div className='rounded-lg bg-green-50 p-3 dark:bg-green-950/20'>
                  <p className='text-muted-foreground mb-1 text-xs font-medium'>
                    {t('card.systemOwesYou')}
                  </p>
                  <p className='text-lg font-bold text-green-600 dark:text-green-400'>
                    {formatCurrency(debt.remainingAmount)}
                  </p>
                </div>
                <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20'>
                  <p className='text-muted-foreground mb-1 text-xs font-medium'>
                    {t('card.canSupplyMore')}
                  </p>
                  <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                    {formatCurrency(availableCredit)}
                  </p>
                </div>
              </div>

              {/* Credit Usage Progress Bar */}
              <div className='bg-background space-y-3 rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconPercentage className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm font-medium'>
                      {t('card.creditUsageRate')}
                    </span>
                  </div>
                  <span className='text-lg font-bold'>
                    {creditUsagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className='bg-muted relative h-3 w-full overflow-hidden rounded-full'>
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      creditUsagePercentage >= 90
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : creditUsagePercentage >= 70
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                    )}
                    style={{
                      width: `${Math.min(creditUsagePercentage, 100)}%`
                    }}
                  />
                  {isCreditLimitNearExhaustion(debt) && (
                    <div className='flex items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-950/30'>
                      <IconAlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                      <p className='text-xs font-medium text-red-700 dark:text-red-300'>
                        {t('card.creditLimitNearMax')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information Section */}
        {Boolean(debt?.remainingAmount) && (
          <>
            <Separator />
            <div className='bg-muted/30 rounded-lg border p-4'>
              <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
                <IconCalendar className='h-4 w-4' />
                {t('card.paymentInformation')}
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='bg-background rounded-lg p-4'>
                  <p className='text-muted-foreground mb-2 text-xs font-medium'>
                    {t('card.expectedSettlementDate')}
                  </p>
                  <div className='flex items-center gap-2'>
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        isOverdueValue
                          ? 'text-red-600 dark:text-red-400'
                          : isDueSoon
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-foreground'
                      )}
                    >
                      {formatDate(debt.dueDate)}
                    </p>
                    {isOverdueValue && (
                      <Badge variant='destructive' className='text-xs'>
                        {t('status.overdue')}
                      </Badge>
                    )}
                    {isDueSoon && !isOverdueValue && (
                      <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
                        {t('card.dueSoon')}
                      </Badge>
                    )}
                  </div>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    {isOverdueValue
                      ? t('card.settlementOverdue', { days: Math.abs(days) })
                      : days >= 0
                        ? t('card.daysUntilSettlement', { days })
                        : t('card.overdueSimple')}
                  </p>
                </div>
                <div className='bg-background rounded-lg p-4'>
                  <p className='text-muted-foreground mb-2 text-xs font-medium'>
                    {t('card.debtStatus')}
                  </p>
                  <p className='text-lg font-semibold'>
                    {debt.status === 'paid'
                      ? t('card.fullyPaid')
                      : debt.status === 'partially_paid'
                        ? t('card.partiallyPaid')
                        : debt.status === 'overdue'
                          ? t('card.paymentOverdue')
                          : t('status.unpaid')}
                  </p>
                  {debt.status !== 'paid' && (
                    <p className='text-muted-foreground mt-2 text-xs'>
                      {t('card.waitingForSystemPayment')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
