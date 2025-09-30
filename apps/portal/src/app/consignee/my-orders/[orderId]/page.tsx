import { OrderDetailPage } from '@/features/consignee/components/order-detail-page';

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function ConsigneeOrderDetailPage({
  params
}: OrderDetailPageProps) {
  const { orderId } = await params;
  return <OrderDetailPage orderId={orderId} />;
}
