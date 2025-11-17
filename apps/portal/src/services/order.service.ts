import { CreateOrderRequest, Order } from '@/features/consignee';
import { fetchJSON } from '../lib/client';
import type { InfinityPaginationResponse } from './product.service';

export async function createOrder(body: CreateOrderRequest) {
  return fetchJSON<Order>('/orders', { method: 'POST', body });
}

export async function fetchOrders({
  page = 1,
  limit = 20
}: {
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Order>>(
    `/orders?${params.toString()}`
  );
}

export async function fetchMyOrders({
  page = 1,
  limit = 20
}: {
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Order>>(
    `/orders/mine?${params.toString()}`
  );
}

export async function fetchOrderById(id: string) {
  return fetchJSON<Order>(`/orders/${id}`);
}
