'use client';

import { HarvestDetail } from '@/features/order-purchase/orders/components/harvest-detail';
import { useParams } from 'next/navigation';
import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';

export default function HarvestDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  return (
    <RouteGuard permission={Permission.VIEW_PURCHASE_ORDER}>
      <HarvestDetail scheduleId={scheduleId} />
    </RouteGuard>
  );
}
