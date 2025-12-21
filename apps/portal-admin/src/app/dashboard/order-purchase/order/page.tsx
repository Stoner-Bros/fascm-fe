'use client';

import HarvestList from '@/features/order-purchase/orders/components/harvest-list/harvest-list';
import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';

export default function OrderPurchasePage() {
  return (
    <RouteGuard permission={Permission.VIEW_PURCHASE_ORDER}>
      <HarvestList />
    </RouteGuard>
  );
}
