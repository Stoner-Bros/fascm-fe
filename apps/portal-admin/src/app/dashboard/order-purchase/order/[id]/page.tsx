'use client';

import { HarvestDetail } from '@/features/order-purchase/orders/components/harvest-detail';
import { useParams } from 'next/navigation';

export default function HarvestDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  return <HarvestDetail scheduleId={scheduleId} />;
}
