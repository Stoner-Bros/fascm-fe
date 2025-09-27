import PageContainer from '@/components/layout/page-container';
import PaymentConfirmation from '@/features/supplier/components/payment-confirmation';

export default function PaymentConfirmationPage() {
  return (
    <PageContainer scrollable={true}>
      <PaymentConfirmation />
    </PageContainer>
  );
}
