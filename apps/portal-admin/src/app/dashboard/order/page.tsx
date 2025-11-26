'use client';

import PageContainer from '@/components/layout/page-container';
import { OrderTable } from '@/features/orders/components';

export default function OrderPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Đơn hàng</h2>
        </div>
        <OrderTable />
      </div>
    </PageContainer>
  );
}
