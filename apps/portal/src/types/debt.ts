// Debt Types
export type DebtStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type DebtType = 'payable' | 'receivable';
export type PartnerType = 'supplier' | 'consignee';

export type Debt = {
  id: string;
  consignee?: unknown | null;
  supplier?: unknown | null;
  partnerType?: PartnerType | null;
  status?: DebtStatus | null;
  dueDate?: Date | null;
  creditLimit?: number | null;
  remainingAmount?: number | null;
  paidAmount?: number | null;
  originalAmount?: number | null;
  debtType?: DebtType | null;
  createdAt: Date;
  updatedAt: Date;
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
