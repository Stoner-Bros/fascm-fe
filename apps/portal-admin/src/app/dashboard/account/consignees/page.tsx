'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import ConsigneesAccount from '@/features/accounts/consignees-account';

export default function ConsigneesAccountPage() {
  return (
    <RouteGuard permission={Permission.VIEW_CONSIGNEE}>
      <PageContainer>
        <ConsigneesAccount />
      </PageContainer>
    </RouteGuard>
  );
}
