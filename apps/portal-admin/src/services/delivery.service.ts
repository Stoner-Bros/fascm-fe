import { fetchJSON } from '@/lib/client';

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

export type FindAllDeliveriesDto = { page?: number; limit?: number };
export type InfinityPaginationResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export async function fetchDeliveries({
  page = 1,
  limit = 10
}: FindAllDeliveriesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Delivery>>(
    `/deliveries?${params.toString()}`
  );
}

export async function fetchDeliveryById(id: string) {
  return fetchJSON<Delivery>(`/deliveries/${id}`);
}
