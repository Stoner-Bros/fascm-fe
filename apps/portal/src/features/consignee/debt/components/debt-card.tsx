import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  IconCreditCard,
  IconCalendar,
  IconCurrencyDong,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconBuilding,
  IconUser,
  IconId,
  IconPercentage,
  IconWallet,
  IconReceipt,
  IconCash
} from '@tabler/icons-react';
import { formatCurrency, formatDate } from '../../orders/utils/formatting';
import type { Debt } from '../types';
import { cn } from '@/lib/utils';

interface DebtCardProps {
  debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
  const getStatusBadge = () => {
    switch (debt.status) {
      case 'paid':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          >
            <IconCheck className='mr-1 h-3 w-3' />
            Đã thanh toán
          </Badge>
        );
      case 'partial':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          >
            <IconClock className='mr-1 h-3 w-3' />
            Thanh toán một phần
          </Badge>
        );
      case 'overdue':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          >
            <IconAlertCircle className='mr-1 h-3 w-3' />
            Quá hạn
          </Badge>
        );
      default:
        return (
          <Badge
            variant='outline'
            className='bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          >
            <IconClock className='mr-1 h-3 w-3' />
            Chưa thanh toán
          </Badge>
        );
    }
  };

  const getDebtTypeLabel = () => {
    return debt.debtType === 'receivable' ? 'Phải thu' : 'Phải trả';
  };

  const isOverdue = () => {
    if (debt.status === 'paid') return false;
    return new Date(debt.dueDate) < new Date();
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(debt.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = getDaysUntilDue();
  const isOverdueValue = isOverdue();
  const isDueSoon = days <= 3 && days >= 0;

  const creditUsagePercentage =
    debt.creditLimit > 0 ? (debt.remainingAmount / debt.creditLimit) * 100 : 0;

  const availableCredit = debt.creditLimit - debt.remainingAmount;
  const paymentPercentage =
    debt.originalAmount > 0 ? (debt.paidAmount / debt.originalAmount) * 100 : 0;

  const getCardBorderColor = () => {
    switch (debt.status) {
      case 'paid':
        return 'border-green-200 dark:border-green-900';
      case 'overdue':
        return 'border-red-200 dark:border-red-900';
      case 'partial':
        return 'border-yellow-200 dark:border-yellow-900';
      default:
        return 'border-orange-200 dark:border-orange-900';
    }
  };

  const handleSettleDebt = () => {
    // TODO: Implement tất toán hóa đơn
    alert(`Tất toán hóa đơn: ${formatCurrency(debt.remainingAmount)}`);
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
              <CardTitle className='text-lg'>Hóa đơn cần tất toán</CardTitle>
              <p className='text-muted-foreground text-xs font-normal'>
                Mã hóa đơn: {debt.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Highlight Section - Số tiền cần tất toán */}
        {debt.remainingAmount > 0 && (
          <div className='rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 dark:border-orange-800 dark:from-orange-950/30 dark:to-orange-900/20'>
            <div className='flex flex-col items-center justify-center text-center md:flex-row md:justify-between md:text-left'>
              <div className='mb-4 md:mb-0'>
                <p className='text-muted-foreground mb-2 text-sm font-medium'>
                  Số tiền cần tất toán
                </p>
                <p className='text-4xl font-bold text-orange-600 dark:text-orange-400'>
                  {formatCurrency(debt.remainingAmount)}
                </p>
                <p className='text-muted-foreground mt-2 text-xs'>
                  Tổng giá trị hóa đơn: {formatCurrency(debt.originalAmount)}
                </p>
              </div>
              <div className='flex flex-col gap-3'>
                <Button
                  onClick={handleSettleDebt}
                  size='lg'
                  className='bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
                >
                  <IconCash className='mr-2 h-5 w-5' />
                  Tất toán hóa đơn
                </Button>
                {days >= 0 && (
                  <p className='text-muted-foreground text-center text-xs'>
                    Còn {days} ngày đến hạn
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Debt Overview Section */}
        <div className='bg-muted/30 rounded-lg border p-4'>
          <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
            <IconCurrencyDong className='h-4 w-4' />
            Tổng quan nợ
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Original Amount */}
            <div className='bg-background rounded-lg p-4 shadow-sm'>
              <div className='mb-2 flex items-center gap-2'>
                <IconWallet className='text-muted-foreground h-4 w-4' />
                <p className='text-muted-foreground text-xs font-medium'>
                  Số tiền gốc
                </p>
              </div>
              <p className='text-xl font-bold'>
                {formatCurrency(debt.originalAmount)}
              </p>
            </div>

            {/* Paid Amount */}
            <div className='rounded-lg bg-green-50 p-4 dark:bg-green-950/20'>
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
            </div>

            {/* Remaining Amount */}
            <div className='rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20'>
              <div className='mb-2 flex items-center gap-2'>
                <IconAlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                <p className='text-muted-foreground text-xs font-medium'>
                  Còn lại
                </p>
              </div>
              <p className='text-xl font-bold text-orange-600 dark:text-orange-400'>
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
        <div className='rounded-lg border bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 dark:from-purple-950/20 dark:to-blue-950/20'>
          <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
            <IconTrendingUp className='h-4 w-4' />
            Hạn mức tín dụng
          </h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='bg-background rounded-lg p-3 shadow-sm'>
                <p className='text-muted-foreground mb-1 text-xs font-medium'>
                  Hạn mức
                </p>
                <p className='text-lg font-bold'>
                  {formatCurrency(debt.creditLimit)}
                </p>
              </div>
              <div className='rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20'>
                <p className='text-muted-foreground mb-1 text-xs font-medium'>
                  Đã sử dụng
                </p>
                <p className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                  {formatCurrency(debt.remainingAmount)}
                </p>
              </div>
              <div className='rounded-lg bg-green-50 p-3 dark:bg-green-950/20'>
                <p className='text-muted-foreground mb-1 text-xs font-medium'>
                  Còn lại
                </p>
                <p className='text-lg font-bold text-green-600 dark:text-green-400'>
                  {formatCurrency(availableCredit)}
                </p>
              </div>
            </div>

            {/* Credit Usage Progress Bar */}
            <div className='bg-background space-y-3 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <IconPercentage className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm font-medium'>Tỷ lệ sử dụng</span>
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
                  style={{ width: `${Math.min(creditUsagePercentage, 100)}%` }}
                />
              </div>
              {creditUsagePercentage >= 90 && (
                <div className='flex items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-950/30'>
                  <IconAlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <p className='text-xs font-medium text-red-700 dark:text-red-300'>
                    Cảnh báo: Hạn mức tín dụng gần hết
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Information Section */}
        <div className='bg-muted/30 rounded-lg border p-4'>
          <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
            <IconCalendar className='h-4 w-4' />
            Thông tin thanh toán
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='bg-background rounded-lg p-4'>
              <p className='text-muted-foreground mb-2 text-xs font-medium'>
                Ngày đến hạn tất toán
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
                    Quá hạn
                  </Badge>
                )}
                {isDueSoon && !isOverdueValue && (
                  <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
                    Sắp đến hạn
                  </Badge>
                )}
              </div>
              <p className='text-muted-foreground mt-2 text-xs'>
                {isOverdueValue
                  ? `Đã quá hạn ${Math.abs(days)} ngày`
                  : days >= 0
                    ? `Còn ${days} ngày đến hạn`
                    : 'Đã quá hạn'}
              </p>
            </div>
            <div className='bg-background rounded-lg p-4'>
              <p className='text-muted-foreground mb-2 text-xs font-medium'>
                Trạng thái hóa đơn
              </p>
              <p className='text-lg font-semibold'>
                {debt.status === 'paid'
                  ? 'Đã tất toán'
                  : debt.status === 'partial'
                    ? 'Đã thanh toán một phần'
                    : debt.status === 'overdue'
                      ? 'Quá hạn - Cần tất toán ngay'
                      : 'Chưa tất toán'}
              </p>
              {debt.status !== 'paid' && (
                <p className='text-muted-foreground mt-2 text-xs'>
                  Vui lòng tất toán trước ngày đến hạn
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Consignee Information Section */}
        {debt.consignee && (
          <div className='bg-muted/30 rounded-lg border p-4'>
            <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
              <IconBuilding className='h-4 w-4' />
              Thông tin đối tác
            </h3>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='bg-background rounded-lg p-3'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconId className='text-muted-foreground h-4 w-4' />
                  <p className='text-muted-foreground text-xs font-medium'>
                    Mã đối tác
                  </p>
                </div>
                <p className='font-semibold'>{debt.consignee.id}</p>
              </div>
              {debt.consignee.organizationName && (
                <div className='bg-background rounded-lg p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <IconBuilding className='text-muted-foreground h-4 w-4' />
                    <p className='text-muted-foreground text-xs font-medium'>
                      Tên tổ chức
                    </p>
                  </div>
                  <p className='font-semibold'>
                    {debt.consignee.organizationName}
                  </p>
                </div>
              )}
              {debt.consignee.user && (
                <div className='bg-background rounded-lg p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <IconUser className='text-muted-foreground h-4 w-4' />
                    <p className='text-muted-foreground text-xs font-medium'>
                      Người đại diện
                    </p>
                  </div>
                  <p className='font-semibold'>
                    {debt.consignee.user.firstName}{' '}
                    {debt.consignee.user.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
