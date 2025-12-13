'use client';

import { OrderDetail } from '@/features/order-sale/orders/components/order-detail';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  return <OrderDetail scheduleId={scheduleId} />;
}
