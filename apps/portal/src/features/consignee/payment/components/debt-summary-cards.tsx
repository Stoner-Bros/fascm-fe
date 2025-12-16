import { Card, CardContent } from '@/components/ui/card';
import {
  IconWallet,
  IconCheck,
  IconAlertCircle,
  IconTrendingUp,
  IconPercentage
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  getPaymentProgressPercentage,
  getCreditUsagePercentage,
  getAvailableCredit
} from '../utils';
import { formatCurrency } from '../utils/formatting';
import type { Debt } from '@/types/debt';

interface DebtSummaryCardsProps {
  debt: Debt;
}

export function DebtSummaryCards({ debt }: DebtSummaryCardsProps) {
  const paymentPercentage = getPaymentProgressPercentage(debt);
  const creditUsagePercentage = getCreditUsagePercentage(debt);
  const availableCredit = getAvailableCredit(debt);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {/* Original Amount */}
      <Card>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <IconWallet className='text-muted-foreground h-4 w-4' />
            <p className='text-muted-foreground text-xs font-medium'>
              Số tiền gốc
            </p>
          </div>
          <p className='text-xl font-bold'>
            {formatCurrency(debt.originalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* Paid Amount */}
      <Card className='bg-green-50 dark:bg-green-950/20'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <IconCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
            <p className='text-muted-foreground text-xs font-medium'>
              Đã thanh toán
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
        </CardContent>
      </Card>

      {/* Remaining Amount */}
      <Card className='bg-orange-50 dark:bg-orange-950/20'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <IconAlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
            <p className='text-muted-foreground text-xs font-medium'>Còn lại</p>
          </div>
          <p className='text-xl font-bold text-orange-600 dark:text-orange-400'>
            {formatCurrency(debt.remainingAmount)}
          </p>
        </CardContent>
      </Card>

      {/* Credit Limit Summary */}
      {debt.creditLimit && (
        <>
          <Card>
            <CardContent className='p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <IconTrendingUp className='text-muted-foreground h-4 w-4' />
                <p className='text-muted-foreground text-xs font-medium'>
                  Hạn mức
                </p>
              </div>
              <p className='text-lg font-bold'>
                {formatCurrency(debt.creditLimit)}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-orange-50 dark:bg-orange-950/20'>
            <CardContent className='p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <IconAlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                <p className='text-muted-foreground text-xs font-medium'>
                  Đã sử dụng
                </p>
              </div>
              <p className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                {formatCurrency(debt.remainingAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-green-50 dark:bg-green-950/20'>
            <CardContent className='p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <IconPercentage className='h-4 w-4 text-green-600 dark:text-green-400' />
                <p className='text-muted-foreground text-xs font-medium'>
                  Còn lại
                </p>
              </div>
              <p className='text-lg font-bold text-green-600 dark:text-green-400'>
                {formatCurrency(availableCredit)}
              </p>
              <div className='mt-2'>
                <div className='bg-muted relative h-2 w-full overflow-hidden rounded-full'>
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
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {creditUsagePercentage.toFixed(1)}% đã sử dụng
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
