'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import StaffsAccount from '@/features/accounts/staffs-account';

export default function StaffsAccountPage() {
  return (
    <RouteGuard permission={Permission.VIEW_STAFF}>
      <PageContainer>
        <StaffsAccount />
      </PageContainer>
    </RouteGuard>
  );
}
