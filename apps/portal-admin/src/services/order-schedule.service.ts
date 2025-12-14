import { fetchJSON } from '@/lib/client';
import type { FindAllOrderSchedulesDto, OrderSchedule } from '@/types/order';
import type { InfinityPaginationResponse } from '../types/common';

export async function fetchOrderSchedules({
  page = 1,
  limit = 10,
  status,
  sort
}: FindAllOrderSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules?${params.toString()}`
  );
}

export async function fetchOrderSchedulesByConsignee({
  consigneeId,
  page = 1,
  limit = 10,
  status,
  sort
}: FindAllOrderSchedulesDto & { consigneeId: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules/consignee/${consigneeId}?${params.toString()}`
  );
}

export async function fetchMyOrderSchedules({
  page = 1,
  limit = 10,
  status,
  sort
}: FindAllOrderSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules/mine?${params.toString()}`
  );
}

export async function fetchOrderScheduleById(id: string) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}`);
}

export async function updateOrderScheduleStatus(
  id: string,
  status: string,
  reason?: string
) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}/status`, {
    method: 'PATCH',
    body: { status, reason }
  });
}
