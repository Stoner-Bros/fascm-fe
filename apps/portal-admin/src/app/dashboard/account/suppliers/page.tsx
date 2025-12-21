'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import SuppliersAccount from '@/features/accounts/suppliers-account';

export default function SuppliersAccountPage() {
  return (
    <RouteGuard permission={Permission.VIEW_SUPPLIER}>
      <PageContainer>
        <SuppliersAccount />
      </PageContainer>
    </RouteGuard>
  );
}
