import PageContainer from '@/components/layout/page-container';
import { DeliveryTracking } from '@/features/logistics/components/delivery-tracking';

export default function DeliveryTrackingPage() {
  return (
    <PageContainer scrollable={true}>
      <DeliveryTracking />
    </PageContainer>
  );
}
