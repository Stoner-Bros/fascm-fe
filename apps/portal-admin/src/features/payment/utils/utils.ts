// ============================================================================
// Utility Functions
// ============================================================================

import type { Debt } from '@/types/debt';

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

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a user-friendly status label
 */
export function getPaymentStatusLabel(status?: string | null): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
    default:
      return 'Pending';
  }
}

/**
 * Get status color classes for UI
 */
export function getPaymentStatusColor(status?: string | null): {
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
    case 'pending':
    default:
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
  }
}

/**
 * Get payment method display name
 */
export function getPaymentMethodLabel(method?: string | null): string {
  switch (method) {
    case 'bank_transfer':
      return 'Bank Transfer (PayOS)';
    case 'cash':
      return 'Cash';
    default:
      return method || 'Unknown';
  }
}

/**
 * Format amount in VND currency
 */
export function formatPaymentAmount(amount?: number | null): string {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
