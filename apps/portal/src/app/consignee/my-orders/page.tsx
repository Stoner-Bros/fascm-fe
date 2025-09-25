import PageContainer from '@/components/layout/page-container';
import { MyOrdersPage } from '@/features/consignee/components/my-orders-page';

export default function ConsigneeMyOrdersPage() {
  return (
    <PageContainer scrollable={true}>
      <MyOrdersPage />
    </PageContainer>
  );
}
