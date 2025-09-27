import PageContainer from '@/components/layout/page-container';
import SupplierHomepage from '@/features/supplier/components/supplier-homepage';

export default function SupplierOverviewPage() {
  return (
    <PageContainer scrollable={true}>
      <SupplierHomepage />
    </PageContainer>
  );
}
