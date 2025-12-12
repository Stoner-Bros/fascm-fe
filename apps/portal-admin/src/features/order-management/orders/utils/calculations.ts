import type { OrderPhase, OrderSchedule } from '@/types/order';

export type ProductTotals = Record<
  string,
  { name: string; total: number; used: number }
>;

export function calculateScheduleTotals(
  schedule: OrderSchedule | null,
  phases: OrderPhase[]
): ProductTotals {
  if (!schedule?.orderDetails) return {};

  const totals: ProductTotals = {};

  // Calculate total quantities from schedule
  schedule.orderDetails.forEach((detail) => {
    const productId = detail.product?.id || '';
    if (!totals[productId]) {
      totals[productId] = {
        name: detail.product?.name || '',
        total: 0,
        used: 0
      };
    }
    totals[productId].total += detail.quantity || 0;
  });

  // Calculate used quantities from phases
  phases.forEach((phase) => {
    phase.orderInvoiceDetails?.forEach((detail) => {
      const productId = detail.product?.id || '';
      if (totals[productId]) {
        totals[productId].used += detail.quantity || 0;
      }
    });
  });

  return totals;
}

export function hasRemainingQuantity(totals: ProductTotals): boolean {
  return Object.values(totals).some((t) => t.total > t.used);
}
