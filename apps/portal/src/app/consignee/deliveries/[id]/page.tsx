import ConsigneeDeliveryDetailFeature from '@/features/consignee/delivery/delivery-detail';

export default async function ConsigneeDeliveryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConsigneeDeliveryDetailFeature deliveryId={id} />;
}
