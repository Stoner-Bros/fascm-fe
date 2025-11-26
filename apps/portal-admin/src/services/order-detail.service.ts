import { fetchJSON } from '@/lib/client';
import type { OrderDetail, FindAllOrderDetailsDto } from '@/types/order-detail';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/order-details';

export async function fetchOrderDetailById(id: string) {
  return fetchJSON<OrderDetail>(`${BASE_PATH}/${id}`);
}

export async function fetchOrderDetails({
  page = 1,
  limit = 50,
  search,
  orderId
}: FindAllOrderDetailsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (search) params.set('search', search);
  if (orderId) params.set('orderId', orderId);

  return fetchJSON<InfinityPaginationResponse<OrderDetail>>(
    `${BASE_PATH}?${params.toString()}`
  );
}
import type { OrderDetailBE } from '@/types/order';

export async function fetchOrderDetailsByOrderId(
  orderId: string,
  page = 1,
  limit = 50
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    orderId
  });
  return fetchJSON<InfinityPaginationResponse<OrderDetailBE>>(
    `/order-details?${params.toString()}`
  );
}
