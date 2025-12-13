import PageContainer from '@/components/layout/page-container';
import { InboundBatchManagement } from '@/features/delivery/components/inbound-batch-management';

export default function InboundBatchesPage() {
  return (
    <PageContainer scrollable={true}>
      <InboundBatchManagement />
    </PageContainer>
  );
}
