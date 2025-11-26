import { fetchJSON } from '../lib/client';

export type Delivery = {
  id: string;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  startAddress?: string | null;
  endAddress?: string | null;
  status?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  orderSchedule?: { id: string } | null;
  truck?: { id: string } | null;
};

export async function fetchDeliveryById(id: string) {
  return fetchJSON<Delivery>(`/deliveries/${id}`);
}

export async function fetchDeliveriesByOrderSchedule({
  orderScheduleId,
  page = 1,
  limit = 10
}: {
  orderScheduleId: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    orderScheduleId
  });
  return fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries?${params.toString()}`);
}
