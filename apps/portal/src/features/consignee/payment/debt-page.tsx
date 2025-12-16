'use client';

import PageContainer from '@/components/layout/page-container';
import {
  DebtCard,
  DebtAlertBanner,
  DebtLoadingSkeleton,
  DebtError
} from './components';
import { useMyDebt } from './hooks';
import { useTranslations } from 'next-intl';

export default function DebtPage() {
  const { debt, isLoading, error, refetch } = useMyDebt();
  const t = useTranslations('Debt');

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
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
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
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
          </div>
          <div className='text-muted-foreground text-center'>{t('noDebt')}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
          <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>

        {/* Alert Banner */}
        {Boolean(debt.remainingAmount) && <DebtAlertBanner debt={debt} />}

        {/* Main Debt Card */}
        <DebtCard debt={debt} onPaymentSuccess={refetch} />
      </div>
    </PageContainer>
  );
}
