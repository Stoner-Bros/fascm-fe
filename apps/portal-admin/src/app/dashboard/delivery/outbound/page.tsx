import PageContainer from '@/components/layout/page-container';
import { OutboundTruckAssignment } from '@/features/logistics/components/outbound-truck-assignment';

export default function OutboundDeliveryPage() {
  return (
    <PageContainer scrollable={true}>
      <OutboundTruckAssignment />
    </PageContainer>
  );
}
