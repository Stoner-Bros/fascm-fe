'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import { notFound } from 'next/navigation';
import WarehouseDetailPage from '@/features/warehouse/components/warehouse-detail-page';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const warehouseId = params.id as string;

  // Validate warehouse ID
  if (!warehouseId || warehouseId === 'undefined') {
    notFound();
  }

  return (
    <RouteGuard permission={Permission.VIEW_WAREHOUSE}>
      <WarehouseDetailPage warehouseId={warehouseId} />
    </RouteGuard>
  );
}
