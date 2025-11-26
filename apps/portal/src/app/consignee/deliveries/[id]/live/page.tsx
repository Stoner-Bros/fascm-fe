import DeliveryLiveMap from '@/features/consignee/delivery/delivery-live-map';

export default async function DeliveryLivePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return <DeliveryLiveMap deliveryId={id} />;
}
