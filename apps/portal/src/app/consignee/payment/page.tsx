import PageContainer from '@/components/layout/page-container';
import { PaymentPage } from '@/features/consignee/components/payment-page';

export default function ConsigneePaymentPage() {
  return (
    <PageContainer scrollable>
      <PaymentPage />
    </PageContainer>
  );
}
