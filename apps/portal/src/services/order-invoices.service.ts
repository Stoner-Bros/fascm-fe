import { fetchJSON } from '../lib/client';
import type { OrderInvoice } from '../types/order';

/**
 * Fetch a single order invoice by ID
 */
export async function fetchOrderInvoiceById(id: string) {
  return fetchJSON<OrderInvoice>(`/order-invoices/${id}`);
}
