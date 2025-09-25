import PageContainer from '@/components/layout/page-container';
import { OrderPage } from '@/features/consignee/components/order-page';

export default function ConsigneeOrderPage() {
  return (
    <PageContainer scrollable={true}>
      <OrderPage />
    </PageContainer>
  );
}
