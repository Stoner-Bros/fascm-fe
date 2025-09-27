import PageContainer from '@/components/layout/page-container';
import CreateHarvestBatchForm from '@/features/supplier/components/create-harvest-batch-form';

export default function CreateHarvestBatchPage() {
  return (
    <PageContainer scrollable={true}>
      <CreateHarvestBatchForm />
    </PageContainer>
  );
}
