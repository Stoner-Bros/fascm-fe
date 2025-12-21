'use client';

import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import DeliveryStaffsAccount from '@/features/accounts/delivery-staffs-account';

export default function DeliveryStaffsAccountPage() {
  return (
    <RouteGuard permission={Permission.VIEW_DELIVERY_STAFF}>
      <PageContainer>
        <DeliveryStaffsAccount />
      </PageContainer>
    </RouteGuard>
  );
}
