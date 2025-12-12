import PageContainer from '@/components/layout/page-container';
import { OutboundDeliveryDetail } from '@/features/delivery/components/outbound-delivery-detail';

interface OutboundDeliveryDetailPageProps {
  params: Promise<{
    deliveryId: string;
  }>;
}

export default async function OutboundDeliveryDetailPage({
  params
}: OutboundDeliveryDetailPageProps) {
  const { deliveryId } = await params;

  return (
    <PageContainer scrollable={true}>
      <OutboundDeliveryDetail deliveryId={deliveryId} />
    </PageContainer>
  );
}
