import { fetchJSON } from '../lib/client';
import type { OrderDetail } from '../types/order';

/**
 * Fetch a single order detail by ID
 */
export async function fetchOrderDetailById(id: string) {
  return fetchJSON<OrderDetail>(`/order-details/${id}`);
}
