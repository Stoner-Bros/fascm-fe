import PageContainer from '@/components/layout/page-container';
import { DeliveryView } from '@/features/delivery/components/delivery-view';

export default function DeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <DeliveryView />
    </PageContainer>
  );
}
