import PageContainer from '@/components/layout/page-container';
import { DeliveryDetail } from '@/features/delivery/components/delivery-detail';

interface DeliveryDetailPageProps {
  params: Promise<{
    containerId: string;
  }>;
}

export default async function DeliveryDetailPage({
  params
}: DeliveryDetailPageProps) {
  const { containerId } = await params;

  return (
    <PageContainer scrollable={true}>
      <DeliveryDetail containerId={containerId} />
    </PageContainer>
  );
}
