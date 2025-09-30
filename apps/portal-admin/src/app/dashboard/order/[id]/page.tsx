'use server';

import { Order } from '@/types/delivery';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { OrderDetail } from '@/features/orders/components';

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'Siêu thị Big C',
    customerAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    customerContact: '0901234567',
    customerType: 'supermarket',
    items: [
      {
        id: 'ITEM-001',
        productId: 'PROD-001',
        productName: 'Cà chua tươi',
        quantity: 50,
        unit: 'kg',
        weight: 50,
        volume: 0.1,
        specialRequirements: 'Bảo quản lạnh'
      }
    ],
    totalWeight: 50,
    totalVolume: 0.1,
    totalValue: 2500000,
    deliveryDate: '2024-01-15',
    priority: 'high',
    specialHandling: 'Bảo quản lạnh',
    requiresSignature: true,
    status: 'confirmed',
    notes: 'Giao hàng vào buổi sáng',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
];

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = mockOrders.find((order) => order.id === id);

  if (!order) {
    notFound();
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <OrderDetail order={order} />
      </div>
    </PageContainer>
  );
}
