import { CreateOrderDetailRequest, OrderDetail } from '@/features/consignee';
import { fetchJSON } from '../lib/client';
import type { InfinityPaginationResponse } from './product.service';

export async function createOrderDetail(body: CreateOrderDetailRequest) {
  return fetchJSON<OrderDetail>('/order-details', { method: 'POST', body });
}

export async function fetchOrderDetails({
  orderId,
  page = 1,
  limit = 50
}: {
  orderId: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    orderId
  });
  return fetchJSON<InfinityPaginationResponse<OrderDetail>>(
    `/order-details?${params.toString()}`
  );
}
