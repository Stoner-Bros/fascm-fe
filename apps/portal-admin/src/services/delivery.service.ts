import { fetchJSON } from '@/lib/client';
import {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum,
  FindAllDeliveriesDto,
  InfinityPaginationResponse,
  UpdateDeliveryDto
} from '@/types';

export async function fetchDeliveries({
  page = 1,
  limit = 10,
  orderScheduleId,
  status,
  sort = 'desc'
}: FindAllDeliveriesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (orderScheduleId) {
    params.append('orderScheduleId', orderScheduleId);
  }
  if (status) {
    params.append('status', status);
  }
  if (sort) {
    params.append('sort', sort);
  }
  return fetchJSON<InfinityPaginationResponse<Delivery>>(
    `/deliveries?${params.toString()}`
  );
}

export async function fetchDeliveryById(id: string) {
  return fetchJSON<Delivery>(`/deliveries/${id}`);
}

export async function createDelivery(data: CreateDeliveryDto) {
  return fetchJSON<Delivery>('/deliveries', {
    method: 'POST',
    body: data
  });
}

export async function updateDelivery(id: string, data: UpdateDeliveryDto) {
  return fetchJSON<Delivery>(`/deliveries/${id}`, {
    method: 'PATCH',
    body: data
  });
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatusEnum
) {
  return fetchJSON<Delivery>(`/deliveries/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
}

export async function deleteDelivery(id: string) {
  return fetchJSON<void>(`/deliveries/${id}`, {
    method: 'DELETE'
  });
}
