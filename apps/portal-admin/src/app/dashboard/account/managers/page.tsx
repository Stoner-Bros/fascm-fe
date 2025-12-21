'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import ManagersAccount from '@/features/accounts/managers-account';

export default function ManagersAccountPage() {
  return (
    <RouteGuard permission={Permission.VIEW_MANAGER}>
      <PageContainer>
        <ManagersAccount />
      </PageContainer>
    </RouteGuard>
  );
}
