import PageContainer from '@/components/layout/page-container';
import { InboundTruckAssignment } from '@/features/logistics/components/inbound-truck-assignment';

export default function InboundDeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <InboundTruckAssignment />
    </PageContainer>
  );
}
