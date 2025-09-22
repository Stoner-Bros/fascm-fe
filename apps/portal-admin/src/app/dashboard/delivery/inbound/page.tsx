import PageContainer from '@/components/layout/page-container';
import { InboundDelivery } from '@/features/delivery/components/inbound-delivery';

export default function InboundDeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <InboundDelivery />
    </PageContainer>
  );
}
