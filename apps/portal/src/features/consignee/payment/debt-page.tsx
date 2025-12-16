'use client';

import PageContainer from '@/components/layout/page-container';
import {
  DebtCard,
  DebtAlertBanner,
  DebtLoadingSkeleton,
  DebtError
} from './components';
import { useMyDebt } from './hooks';

export default function DebtPage() {
  const { debt, isLoading, error, refetch } = useMyDebt();

  if (isLoading) {
    return (
      <PageContainer>
        <DebtLoadingSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className='w-full flex-1 space-y-6'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Tất toán hóa đơn
            </h2>
            <p className='text-muted-foreground mt-1'>
              Vui lòng tất toán hóa đơn trước ngày đến hạn
            </p>
          </div>
          <DebtError error={error} onRetry={refetch} />
        </div>
      </PageContainer>
    );
  }

  if (!debt) {
    return (
      <PageContainer>
        <div className='w-full flex-1 space-y-6'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Tất toán hóa đơn
            </h2>
            <p className='text-muted-foreground mt-1'>
              Vui lòng tất toán hóa đơn trước ngày đến hạn
            </p>
          </div>
          <div className='text-muted-foreground text-center'>
            Không có thông tin nợ nào
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Tất toán hóa đơn
          </h2>
          <p className='text-muted-foreground mt-1'>
            Vui lòng tất toán hóa đơn trước ngày đến hạn
          </p>
        </div>

        {/* Alert Banner */}
        {Boolean(debt.remainingAmount) && <DebtAlertBanner debt={debt} />}

        {/* Main Debt Card */}
        <DebtCard debt={debt} onPaymentSuccess={refetch} />
      </div>
    </PageContainer>
  );
}
