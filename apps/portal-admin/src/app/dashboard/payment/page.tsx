'use client';

import PageContainer from '@/components/layout/page-container';
import { RouteGuard } from '@/components/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Permission } from '@/constants/permissions';
import { DebtTable } from '@/features/payment/components/debt-table';
import { useDebts } from '@/features/payment/hooks/use-debts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function PaymentPage() {
  const t = useTranslations('Payment.page');
  const [activeTab, setActiveTab] = useState<'supplier' | 'consignee'>(
    'supplier'
  );

  const supplierDebts = useDebts({
    partnerType: 'supplier',
    enabled: activeTab === 'supplier'
  });
  const consigneeDebts = useDebts({
    partnerType: 'consignee',
    enabled: activeTab === 'consignee'
  });

  return (
    <RouteGuard permission={Permission.VIEW_PAYMENT}>
      <PageContainer scrollable={true}>
        <div className='w-full space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                {t('title')}
              </h2>
              <p className='text-muted-foreground'>{t('subtitle')}</p>
            </div>
          </div>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'supplier' | 'consignee')
                }
                className='w-full'
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='supplier'>
                    {t('tabs.supplier')}
                  </TabsTrigger>
                  <TabsTrigger value='consignee'>
                    {t('tabs.consignee')}
                  </TabsTrigger>
                </TabsList>

                {/* Supplier Tab */}
                <TabsContent value='supplier' className='mt-6'>
                  {supplierDebts.loading ? (
                    <DataTableSkeleton columnCount={10} rowCount={10} />
                  ) : supplierDebts.debts.length === 0 ? (
                    <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                      {t('empty.supplier')}
                    </div>
                  ) : (
                    <DebtTable
                      debts={supplierDebts.debts}
                      page={supplierDebts.page}
                      limit={supplierDebts.limit}
                      pageCount={supplierDebts.pageCount}
                      onPageChange={supplierDebts.setPage}
                      onLimitChange={supplierDebts.setLimit}
                      partnerType='supplier'
                    />
                  )}
                </TabsContent>

                {/* Consignee Tab */}
                <TabsContent value='consignee' className='mt-6'>
                  {consigneeDebts.loading ? (
                    <DataTableSkeleton columnCount={10} rowCount={10} />
                  ) : consigneeDebts.debts.length === 0 ? (
                    <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                      {t('empty.consignee')}
                    </div>
                  ) : (
                    <DebtTable
                      debts={consigneeDebts.debts}
                      page={consigneeDebts.page}
                      limit={consigneeDebts.limit}
                      pageCount={consigneeDebts.pageCount}
                      onPageChange={consigneeDebts.setPage}
                      onLimitChange={consigneeDebts.setLimit}
                      partnerType='consignee'
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </RouteGuard>
  );
}
