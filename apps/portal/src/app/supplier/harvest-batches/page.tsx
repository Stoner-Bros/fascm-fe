import PageContainer from '@/components/layout/page-container';
import { HarvestBatchList } from '@/features/supplier/components/harvest-batch-list';

export default function HarvestBatchesPage() {
  return (
    <PageContainer scrollable={true}>
      <HarvestBatchList />
    </PageContainer>
  );
}
