import { fetchJSON } from '../lib/client';
import type { InfinityPaginationResponse } from '../types/common';
import type {
  CreateMultipleOrderPhaseDto,
  CreateOrderPhaseDto,
  FindAllOrderPhasesDto,
  OrderPhase,
  UpdateOrderPhaseDto,
  UpdateOrderPhaseStatusDto
} from '../types/order';

/**
 * Create a new order phase
 */
export async function createOrderPhase(body: CreateOrderPhaseDto) {
  return fetchJSON<OrderPhase>('/order-phases', {
    method: 'POST',
    body
  });
}

/**
 * Create multiple order phases at once
 */
export async function createMultipleOrderPhases(
  body: CreateMultipleOrderPhaseDto
) {
  return fetchJSON<OrderPhase[]>('/order-phases/multiple', {
    method: 'POST',
    body
  });
}

/**
 * Fetch all order phases with pagination
 */
export async function fetchOrderPhases({
  page = 1,
  limit = 10
}: FindAllOrderPhasesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<OrderPhase>>(
    `/order-phases?${params.toString()}`
  );
}

/**
 * Fetch order phases by order schedule ID with pagination
 */
export async function fetchOrderPhasesBySchedule(
  orderScheduleId: string,
  { page = 1, limit = 10 }: FindAllOrderPhasesDto = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<OrderPhase>>(
    `/order-phases/order-schedule/${orderScheduleId}?${params.toString()}`
  );
}

/**
 * Fetch a single order phase by ID
 */
export async function fetchOrderPhaseById(id: string) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}`);
}

/**
 * Update an order phase
 */
export async function updateOrderPhase(id: string, body: UpdateOrderPhaseDto) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}`, {
    method: 'PATCH',
    body
  });
}

/**
 * Delete an order phase
 */
export async function deleteOrderPhase(id: string) {
  return fetchJSON<void>(`/order-phases/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Update order phase status
 */
export async function updateOrderPhaseStatus(
  id: string,
  body: UpdateOrderPhaseStatusDto
) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}/status`, {
    method: 'PATCH',
    body
  });
}

/**
 * Upload image proof for an order phase
 */
export async function uploadOrderPhaseImageProof(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return fetchJSON<{ path: string }>(`/order-phases/${id}/upload-img-proof`, {
    method: 'POST',
    body: formData
  });
}
