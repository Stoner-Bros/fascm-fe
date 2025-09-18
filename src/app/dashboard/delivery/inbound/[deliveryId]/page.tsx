import PageContainer from '@/components/layout/page-container';
import { InboundDeliveryDetail } from '@/features/delivery/components/inbound-delivery-detail';

interface InboundDeliveryDetailPageProps {
  params: Promise<{
    deliveryId: string;
  }>;
}

export default async function InboundDeliveryDetailPage({
  params
}: InboundDeliveryDetailPageProps) {
  const { deliveryId } = await params;

  return (
    <PageContainer scrollable={true}>
      <InboundDeliveryDetail deliveryId={deliveryId} />
    </PageContainer>
  );
}
