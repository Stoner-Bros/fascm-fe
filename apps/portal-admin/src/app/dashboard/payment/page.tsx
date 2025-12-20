'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDebts } from '@/features/payment/hooks/use-debts';
import { DebtTable } from '@/features/payment/components/debt-table';

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<'supplier' | 'consignee'>(
    'supplier'
  );

  const supplierDebts = useDebts({ partnerType: 'supplier' });
  const consigneeDebts = useDebts({ partnerType: 'consignee' });

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Debt Management
            </h2>
            <p className='text-muted-foreground'>
              View and manage supplier and consignee debts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Debts</CardTitle>
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
                  Supplier ({supplierDebts.debts.length})
                </TabsTrigger>
                <TabsTrigger value='consignee'>
                  Consignee ({consigneeDebts.debts.length})
                </TabsTrigger>
              </TabsList>

              {/* Supplier Tab */}
              <TabsContent value='supplier' className='mt-6'>
                {supplierDebts.loading ? (
                  <DataTableSkeleton columnCount={10} rowCount={10} />
                ) : supplierDebts.debts.length === 0 ? (
                  <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                    No supplier debts found
                  </div>
                ) : (
                  <DebtTable
                    debts={supplierDebts.debts}
                    page={supplierDebts.page}
                    limit={supplierDebts.limit}
                    pageCount={supplierDebts.pageCount}
                    onPageChange={supplierDebts.setPage}
                  />
                )}
              </TabsContent>

              {/* Consignee Tab */}
              <TabsContent value='consignee' className='mt-6'>
                {consigneeDebts.loading ? (
                  <DataTableSkeleton columnCount={10} rowCount={10} />
                ) : consigneeDebts.debts.length === 0 ? (
                  <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                    No consignee debts found
                  </div>
                ) : (
                  <DebtTable
                    debts={consigneeDebts.debts}
                    page={consigneeDebts.page}
                    limit={consigneeDebts.limit}
                    pageCount={consigneeDebts.pageCount}
                    onPageChange={consigneeDebts.setPage}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
