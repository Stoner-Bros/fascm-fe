'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import { OrderDetail } from '@/features/order-sale/orders/components/order-detail';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  return (
    <RouteGuard permission={Permission.VIEW_SALE_ORDER}>
      <OrderDetail scheduleId={scheduleId} />
    </RouteGuard>
  );
}
