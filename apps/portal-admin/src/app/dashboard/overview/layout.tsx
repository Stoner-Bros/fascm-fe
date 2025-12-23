import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { OverviewCards } from '@/features/overview/components/overview-cards';
import { DebtGraph } from '@/features/overview/components/debt-graph';
import { WarehouseGraph } from '@/features/overview/components/warehouse-graph';
import { SupplierGraph } from '@/features/overview/components/supplier-graph';
import { TopCustomersGraph } from '@/features/overview/components/top-customers-graph';
import { getTranslations } from 'next-intl/server';
import { InventoryGraph } from '@/features/overview/components/inventory-graph';

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const t = await getTranslations('Overview');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
        </div>

        <OverviewCards />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <TopCustomersGraph />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <SupplierGraph />
          </div>
          {/* <div className='col-span-4'>{bar_stats}</div>

          <div className='col-span-4 md:col-span-3'>
            <InventoryGraph />
          </div> */}

          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>

          {/* <div className='col-span-4'>
            <DebtGraph />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <WarehouseGraph />
          </div> */}
        </div>
      </div>
    </PageContainer>
  );
}
