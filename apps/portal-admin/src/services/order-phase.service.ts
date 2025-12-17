import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '../types/common';
import type {
  OrderPhase,
  CreateOrderPhaseDto,
  CreateMultipleOrderPhaseDto,
  UpdateOrderPhaseDto,
  UpdateOrderPhaseStatusDto,
  FindAllOrderPhasesDto
} from '../types/order';

export async function createOrderPhase(body: CreateOrderPhaseDto) {
  return fetchJSON<OrderPhase>('/order-phases', {
    method: 'POST',
    body
  });
}

export async function createMultipleOrderPhases(
  body: CreateMultipleOrderPhaseDto
) {
  return fetchJSON<OrderPhase[]>('/order-phases/multiple', {
    method: 'POST',
    body
  });
}

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

export async function fetchOrderPhasesBySchedule({
  orderScheduleId,
  page = 1,
  limit = 10
}: FindAllOrderPhasesDto & { orderScheduleId: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<OrderPhase>>(
    `/order-phases/order-schedule/${orderScheduleId}?${params.toString()}`
  );
}

export async function fetchOrderPhaseById(id: string) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}`);
}

export async function updateOrderPhase(id: string, body: UpdateOrderPhaseDto) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function updateOrderPhaseStatus(
  id: string,
  body: UpdateOrderPhaseStatusDto
) {
  return fetchJSON<OrderPhase>(`/order-phases/${id}/status`, {
    method: 'PATCH',
    body
  });
}

export async function deleteOrderPhase(id: string) {
  return fetchJSON<void>(`/order-phases/${id}`, {
    method: 'DELETE'
  });
}

export async function uploadPhaseImageProof(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return fetchJSON<{ path: string }>(`/order-phases/${id}/upload-img-proof`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type with boundary
    file: true
  });
}
