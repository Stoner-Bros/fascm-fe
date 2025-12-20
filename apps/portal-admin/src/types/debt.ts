import type { Supplier } from './supplier';
import type { Consignee } from './consignee';

// Debt Types
export type DebtStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type DebtType = 'payable' | 'receivable';
export type PartnerType = 'supplier' | 'consignee';

export type Debt = {
  id: string;
  consignee?: Consignee | null;
  supplier?: Supplier | null;
  partnerType?: PartnerType | null;
  status?: DebtStatus | null;
  dueDate?: Date | string | null;
  creditLimit?: number | null;
  remainingAmount?: number | null;
  paidAmount?: number | null;
  originalAmount?: number | null;
  debtType?: DebtType | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateDebtDto = {
  consignee?: { id: string } | null;
  supplier?: { id: string } | null;
  partnerType: PartnerType;
  status: DebtStatus;
  dueDate?: Date | null;
  creditLimit?: number | null;
  remainingAmount?: number | null;
  paidAmount?: number | null;
  originalAmount?: number | null;
  debtType: DebtType;
};

export type UpdateDebtDto = Partial<CreateDebtDto>;
