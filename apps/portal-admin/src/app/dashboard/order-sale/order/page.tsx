'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import OrderList from '@/features/order-sale/orders/components/order-list/order-list';

export default function OrdersPage() {
  return (
    <RouteGuard permission={Permission.VIEW_SALE_ORDER}>
      <OrderList />
    </RouteGuard>
  );
}
