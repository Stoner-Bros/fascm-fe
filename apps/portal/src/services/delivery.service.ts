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
  harvestPhaseId?: string | null;
  harvestScheduleId?: string | null;
  orderPhaseId?: string | null;
  orderScheduleId?: string | null;
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
  harvestPhaseId,
  orderPhaseId,
  page = 1,
  limit = 100
}: {
  harvestPhaseId?: string;
  orderPhaseId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (harvestPhaseId) {
    params.append('harvestPhaseId', harvestPhaseId);
  }
  if (orderPhaseId) {
    params.append('orderPhaseId', orderPhaseId);
  }
  return fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries?${params.toString()}`);
}
//create fetchDeliveriesByHarvestPhase
export async function fetchDeliveriesByHarvestPhase({
  harvestPhaseId,
  page = 1,
  limit = 10
}: {
  harvestPhaseId: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  params.append('harvestPhaseId', harvestPhaseId);
  const res = await fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries/with-harvest-phase?${params.toString()}`);

  return {
    ...res
  };
}
export async function fetchDeliveriesByOrderPhase({
  orderPhaseId,
  page = 1,
  limit = 10
}: {
  orderPhaseId: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  params.append('orderPhaseId', orderPhaseId);
  const res = await fetchJSON<{
    data: Delivery[];
    page: number;
    limit: number;
    hasNextPage: boolean;
  }>(`/deliveries/with-order-phase?${params.toString()}`);

  return {
    ...res
  };
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
