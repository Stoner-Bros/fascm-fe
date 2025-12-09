import { fetchJSON } from '../lib/client';
import type { InfinityPaginationResponse } from '../types/common';
import type {
  CreateOrderScheduleDto,
  FindAllOrderSchedulesDto,
  OrderSchedule,
  UpdateOrderScheduleDto,
  UpdateOrderScheduleStatusDto
} from '../types/order';

/**
 * Create a new order schedule
 */
export async function createOrderSchedule(body: CreateOrderScheduleDto) {
  return fetchJSON<OrderSchedule>('/order-schedules', {
    method: 'POST',
    body
  });
}

/**
 * Fetch all order schedules with pagination and filters
 */
export async function fetchOrderSchedules({
  page = 1,
  limit = 10,
  status,
  sort = 'desc'
}: FindAllOrderSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort
  });
  if (status) params.set('status', status);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules?${params.toString()}`
  );
}

/**
 * Fetch order schedules by consignee ID with pagination and filters
 */
export async function fetchOrderSchedulesByConsignee(
  consigneeId: string,
  { page = 1, limit = 10, status, sort = 'desc' }: FindAllOrderSchedulesDto = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort
  });
  if (status) params.set('status', status);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules/consignee/${consigneeId}?${params.toString()}`
  );
}

/**
 * Fetch current user's order schedules (mine)
 */
export async function fetchMyOrderSchedules({
  page = 1,
  limit = 10,
  status,
  sort = 'desc'
}: FindAllOrderSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort
  });
  if (status) params.set('status', status);

  return fetchJSON<InfinityPaginationResponse<OrderSchedule>>(
    `/order-schedules/mine?${params.toString()}`
  );
}

/**
 * Fetch a single order schedule by ID
 */
export async function fetchOrderScheduleById(id: string) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}`);
}

/**
 * Update an order schedule
 */
export async function updateOrderSchedule(
  id: string,
  body: UpdateOrderScheduleDto
) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}`, {
    method: 'PATCH',
    body
  });
}

/**
 * Update order schedule status
 */
export async function updateOrderScheduleStatus(
  id: string,
  body: UpdateOrderScheduleStatusDto
) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}/status`, {
    method: 'PATCH',
    body
  });
}
