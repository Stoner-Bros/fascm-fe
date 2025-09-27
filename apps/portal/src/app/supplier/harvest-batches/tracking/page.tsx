import PageContainer from '@/components/layout/page-container';
import HarvestBatchTracking from '@/features/supplier/components/harvest-batch-tracking';

export default function HarvestBatchTrackingPage() {
  return (
    <PageContainer scrollable={true}>
      <HarvestBatchTracking />
    </PageContainer>
  );
}
