'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import { WarehouseOverviewPage } from '@/features/warehouse/components/warehouse-overview-page';

export default function Page() {
  return (
    <RouteGuard permission={Permission.VIEW_WAREHOUSE}>
      <WarehouseOverviewPage />
    </RouteGuard>
  );
}
