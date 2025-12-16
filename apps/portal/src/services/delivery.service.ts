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
  orderPhase?: { id: string } | null;
  harvestPhase?: { id: string } | null;
  harvestSchedule?: {
    id: string;
    description?: string | null;
    harvestDate?: string | null;
    status?: string | null;
  } | null;
  truck?: {
    id: string;
    licensePlate?: string | null;
    model?: string | null;
    capacity?: number | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchDeliveryById(id: string) {
  return fetchJSON<Delivery>(`/deliveries/${id}`);
}

export async function fetchDeliveries({
  page = 1,
  limit = 100
}: {
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries?${params.toString()}`);
}
//create fetchDeliveriesByHaverstSchedule
export async function fetchDeliveriesByHarvestSchedule({
  harvestScheduleId,
  page = 1,
  limit = 10
}: {
  harvestScheduleId: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    harvestScheduleId
  });
  return fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries?${params.toString()}`);
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

export async function updateDelivery(
  id: string,
  data: Partial<Delivery>
): Promise<Delivery> {
  return fetchJSON<Delivery>(`/deliveries/${id}`, {
    method: 'PATCH',
    body: data
  });
}

export async function confirmDeliveryReceived(id: string): Promise<Delivery> {
  return updateDelivery(id, { status: 'completed' });
}
