import PageContainer from '@/components/layout/page-container';
import { DeliveryOverview } from '@/features/delivery/components/delivery-overview';

export default function DeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <DeliveryOverview />
    </PageContainer>
  );
}
