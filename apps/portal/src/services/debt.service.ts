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
  limit = 10
}: {
  page?: number;
  limit?: number;
} = {}): Promise<InfinityPaginationResponse<Debt>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
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

/**
 * Fetch payments by debt ID with pagination
 *
 * @param id - Debt ID
 * @param options - Pagination options
 * @returns Paginated list of payments
 */
export async function fetchPaymentsByDebtId(
  id: string,
  options: { page?: number; limit?: number } = {}
): Promise<InfinityPaginationResponse<Payment>> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', String(options.page));
  if (options.limit) params.append('limit', String(options.limit));

  return fetchJSON<InfinityPaginationResponse<Payment>>(
    `/debts/${id}/payments?${params.toString()}`
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a user-friendly status label
 */
export function getDebtStatusLabel(status?: string | null): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'partially_paid':
      return 'Partially Paid';
    case 'overdue':
      return 'Overdue';
    case 'unpaid':
    default:
      return 'Unpaid';
  }
}

/**
 * Get status color classes for UI
 */
export function getDebtStatusColor(status?: string | null): {
  text: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case 'paid':
      return {
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    case 'partially_paid':
      return {
        text: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      };
    case 'overdue':
      return {
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    case 'unpaid':
    default:
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
  }
}

/**
 * Get debt type display name
 */
export function getDebtTypeLabel(type?: string | null): string {
  switch (type) {
    case 'payable':
      return 'Payable';
    case 'receivable':
      return 'Receivable';
    default:
      return type || 'Unknown';
  }
}

/**
 * Get partner type display name
 */
export function getPartnerTypeLabel(type?: string | null): string {
  switch (type) {
    case 'supplier':
      return 'Supplier';
    case 'consignee':
      return 'Consignee';
    default:
      return type || 'Unknown';
  }
}

/**
 * Format amount in VND currency
 */
export function formatDebtAmount(amount?: number | null): string {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Calculate debt progress percentage
 */
export function getDebtProgressPercentage(debt: Debt): number {
  if (!debt.originalAmount || debt.originalAmount === 0) return 0;
  const paid = debt.paidAmount || 0;
  return Math.min(100, Math.round((paid / debt.originalAmount) * 100));
}

/**
 * Check if debt is overdue
 */
export function isDebtOverdue(debt: Debt): boolean {
  if (!debt.dueDate) return false;
  const dueDate = new Date(debt.dueDate);
  const now = new Date();
  return dueDate < now && debt.status !== 'paid';
}
