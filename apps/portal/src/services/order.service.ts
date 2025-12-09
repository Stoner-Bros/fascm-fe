import { fetchJSON } from '../lib/client';
import type { Order } from '../types/order';

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(id: string) {
  return fetchJSON<Order>(`/orders/${id}`);
}
