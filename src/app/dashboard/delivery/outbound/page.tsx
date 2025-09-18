import PageContainer from '@/components/layout/page-container';
import { OutboundDelivery } from '@/features/delivery/components/outbound-delivery';

export default function OutboundDeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <OutboundDelivery />
    </PageContainer>
  );
}
