import type { Debt } from '@/types/debt';

/**
 * Calculate days until due date
 * Returns negative number if overdue
 */
export function getDaysUntilDue(dueDate?: Date | string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if debt is overdue
 */
export function isDebtOverdue(debt: Debt): boolean {
  if (!debt.dueDate || debt.status === 'paid') return false;
  return getDaysUntilDue(debt.dueDate) < 0;
}

/**
 * Check if debt is due soon (within 3 days)
 */
export function isDebtDueSoon(debt: Debt): boolean {
  if (!debt.dueDate || debt.status === 'paid') return false;
  const days = getDaysUntilDue(debt.dueDate);
  return days <= 3 && days >= 0;
}

/**
 * Calculate credit usage percentage
 */
export function getCreditUsagePercentage(debt: Debt): number {
  if (!debt.creditLimit || debt.creditLimit === 0) return 0;
  const used = debt.remainingAmount || 0;
  return Math.min(100, (used / debt.creditLimit) * 100);
}

/**
 * Calculate available credit
 */
export function getAvailableCredit(debt: Debt): number {
  const creditLimit = debt.creditLimit || 0;
  const remaining = debt.remainingAmount || 0;
  return Math.max(0, creditLimit - remaining);
}

/**
 * Calculate payment progress percentage
 */
export function getPaymentProgressPercentage(debt: Debt): number {
  if (!debt.originalAmount || debt.originalAmount === 0) return 0;
  const paid = debt.paidAmount || 0;
  return Math.min(100, Math.round((paid / debt.originalAmount) * 100));
}

/**
 * Check if credit limit is near exhaustion (>= 90%)
 */
export function isCreditLimitNearExhaustion(debt: Debt): boolean {
  return getCreditUsagePercentage(debt) >= 90;
}
