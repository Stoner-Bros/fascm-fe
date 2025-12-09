import { fetchJSON } from '../lib/client';
import type { OrderInvoiceDetail } from '../types/order';

/**
 * Fetch a single order invoice detail by ID
 */
export async function fetchOrderInvoiceDetailById(id: string) {
  return fetchJSON<OrderInvoiceDetail>(`/order-invoice-details/${id}`);
}
