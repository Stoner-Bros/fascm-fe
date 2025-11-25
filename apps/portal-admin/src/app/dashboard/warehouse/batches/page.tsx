import PageContainer from '@/components/layout/page-container';
import { BatchManagement } from '@/features/warehouse/components/batch-management';

export const metadata = {
  title: 'Dashboard: Batch Manage'
};

export default function BatchManagePage() {
  return (
    <PageContainer scrollable={true}>
      <BatchManagement />
    </PageContainer>
  );
}
