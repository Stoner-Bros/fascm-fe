import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import type { Debt, CreateDebtDto, UpdateDebtDto } from '@/types/debt';
import type { Payment } from '@/types/payment';

// ============================================================================
// HTTP API Functions
// ============================================================================

/**
 * Create a new debt
 *
 * @param body - Debt creation data
 * @returns Created debt
 */
export async function createDebt(body: CreateDebtDto): Promise<Debt> {
  return fetchJSON<Debt>('/debts', {
    method: 'POST',
    body
  });
}

/**
 * Fetch all debts with pagination
 *
 * @param options - Pagination options
 * @returns Paginated list of debts
 */
export async function fetchDebts({
  page = 1,
  limit = 10,
  partnerType
}: {
  page?: number;
  limit?: number;
  partnerType?: 'supplier' | 'consignee';
} = {}): Promise<InfinityPaginationResponse<Debt>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (partnerType) {
    params.append('partnerType', partnerType);
  }
  return fetchJSON<InfinityPaginationResponse<Debt>>(
    `/debts?${params.toString()}`
  );
}

/**
 * Fetch debts for the current user
 * (Returns debt associated with the authenticated user's partner profile)
 *
 * @returns User's debt
 */
export async function fetchMyDebts(): Promise<Debt> {
  return fetchJSON<Debt>('/debts/my-debts');
}

/**
 * Fetch a single debt by ID
 *
 * @param id - Debt ID
 * @returns Debt details
 */
export async function fetchDebtById(id: string): Promise<Debt> {
  return fetchJSON<Debt>(`/debts/${id}`);
}

/**
 * Fetch payments by debt ID
 *
 * @param id - Debt ID
 * @returns List of payments
 */
export async function fetchPaymentsByDebtId(
  id: string,
  { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
): Promise<InfinityPaginationResponse<Payment>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Payment>>(
    `/debts/${id}/payments?${params.toString()}`
  );
}

/**
 * Update a debt
 *
 * @param id - Debt ID
 * @param body - Debt update data
 * @returns Updated debt
 */
export async function updateDebt(
  id: string,
  body: UpdateDebtDto
): Promise<Debt> {
  return fetchJSON<Debt>(`/debts/${id}`, {
    method: 'PATCH',
    body
  });
}

/**
 * Delete a debt
 *
 * @param id - Debt ID
 */
export async function deleteDebt(id: string): Promise<void> {
  await fetchJSON(`/debts/${id}`, {
    method: 'DELETE'
  });
}
