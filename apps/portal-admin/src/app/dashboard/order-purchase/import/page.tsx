'use client';

import { ImportList } from '@/features/order-purchase/import';
import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';

export default function ImportTicketsPage() {
  return (
    <RouteGuard permission={Permission.MANAGE_PURCHASE_IMPORT}>
      <ImportList />
    </RouteGuard>
  );
}
