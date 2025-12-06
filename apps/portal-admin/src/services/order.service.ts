import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import type {
  OrderBE,
  FindAllOrdersDto,
  OrderWithDetailsResponseDto
} from '@/types/order';

export async function fetchOrders({
  page = 1,
  limit = 10
}: FindAllOrdersDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<OrderBE>>(
    `/orders?${params.toString()}`
  );
}
export async function fetchOrderWithDetails(id: string) {
  return fetchJSON<OrderWithDetailsResponseDto>(`/orders/${id}/full-info`);
}
export async function fetchOrdersByStatus({
  status,
  page = 1,
  limit = 10
}: FindAllOrdersDto & { status: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status
  });
  return fetchJSON<InfinityPaginationResponse<OrderBE>>(
    `/orders?${params.toString()}`
  );
}
export async function fetchOrderById(id: string) {
  return fetchJSON<OrderBE>(`/orders/${id}`);
}
