'use client';

import PageContainer from '@/components/layout/page-container';
import { DebtCard, DebtLoadingSkeleton, DebtError } from './components';
import { useMyDebt } from './hooks';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentHistoryTable } from './components/payment-history-table';
import { fetchPaymentsByDebtId } from '@/services/debt.service';
import { useEffect, useState } from 'react';
import type { Payment } from '@/types/payment';

export default function DebtPage() {
  const { debt, isLoading, error, refetch } = useMyDebt();
  const t = useTranslations('Debt');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadPayments() {
      if (!debt?.id) return;
      try {
        const response = await fetchPaymentsByDebtId(debt.id, { page, limit });
        setPayments(response.data);
        if (response.hasNextPage) {
          setPageCount((prev) => (page >= prev ? page + 1 : prev));
        } else {
          setPageCount(page);
        }
      } catch (err) {
        console.error('Failed to load payments', err);
      }
    }

    if (debt?.id) {
      loadPayments();
    }
  }, [debt?.id, page, limit, refreshKey]);

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

        {/* Main Content with Tabs */}
        <Tabs defaultValue='debt' className='w-full'>
          <TabsList>
            <TabsTrigger value='debt'>{t('tabs.debt')}</TabsTrigger>
            <TabsTrigger value='history'>{t('tabs.history')}</TabsTrigger>
          </TabsList>
          <TabsContent value='debt' className='mt-6'>
            <DebtCard debt={debt} />
          </TabsContent>
          <TabsContent value='history' className='mt-6'>
            <div className='rounded-md border'>
              <PaymentHistoryTable
                payments={payments}
                page={page}
                limit={limit}
                pageCount={pageCount}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onPaymentConfirmed={() => setRefreshKey((prev) => prev + 1)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
