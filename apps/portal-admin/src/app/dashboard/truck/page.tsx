import PageContainer from '@/components/layout/page-container';
import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import { TruckManagement } from '@/features/truck/truck-management';

export default function TruckPage() {
  return (
    <RouteGuard permission={Permission.VIEW_TRUCK}>
      <PageContainer scrollable={true}>
        <TruckManagement />
      </PageContainer>
    </RouteGuard>
  );
}
