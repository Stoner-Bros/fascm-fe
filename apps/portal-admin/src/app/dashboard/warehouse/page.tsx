'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import { WarehouseOverviewPage } from '@/features/warehouse/components/warehouse-overview-page';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const warehouseId = useAuthStore
    .getState()
    .fullInfo?.warehouse?.id?.toString();

  useEffect(() => {
    if (warehouseId) {
      router.replace(`/dashboard/warehouse/${warehouseId}`);
    }
  }, [warehouseId, router]);

  return (
    <RouteGuard permission={Permission.VIEW_WAREHOUSE}>
      {warehouseId ? null : <WarehouseOverviewPage />}
    </RouteGuard>
  );
}
