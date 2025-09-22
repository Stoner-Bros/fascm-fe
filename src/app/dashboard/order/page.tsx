'use client';

import { OrderList } from '@/features/orders/components';
import { Order } from '@/types/delivery';
import PageContainer from '@/components/layout/page-container';

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
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Nhà hàng ABC',
    customerAddress: '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
    customerContact: '0907654321',
    customerType: 'restaurant',
    items: [
      {
        id: 'ITEM-002',
        productId: 'PROD-002',
        productName: 'Thịt bò tươi',
        quantity: 25,
        unit: 'kg',
        weight: 25,
        volume: 0.05,
        specialRequirements: 'Bảo quản đông lạnh'
      }
    ],
    totalWeight: 25,
    totalVolume: 0.05,
    totalValue: 4500000,
    deliveryDate: '2024-01-16',
    priority: 'urgent',
    specialHandling: 'Bảo quản đông lạnh',
    requiresSignature: true,
    status: 'packed',
    notes: 'Giao hàng trước 10h sáng',
    createdAt: '2024-01-11T09:30:00Z',
    updatedAt: '2024-01-11T14:20:00Z'
  }
];

export default function OrderPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Đơn hàng</h2>
        </div>

        <OrderList orders={mockOrders} />
      </div>
    </PageContainer>
  );
}
