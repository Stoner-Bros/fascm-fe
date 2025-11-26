import PageContainer from '@/components/layout/page-container';
import { OrderDetail } from '@/features/orders/components';
import React from 'react';

export default function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <OrderDetail orderId={id} />
      </div>
    </PageContainer>
  );
}
