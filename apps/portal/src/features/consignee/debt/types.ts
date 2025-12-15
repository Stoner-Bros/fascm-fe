export interface Debt {
  id: string;
  consignee: {
    id: string;
    contact: string | null;
    taxCode: string | null;
    address: string | null;
    certificate: string | null;
    qrCode: string | null;
    organizationName: string | null;
    representativeName: string | null;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      role: {
        id: number;
        name: string;
        __entity: string;
      };
      status: {
        id: number;
        name: string;
        __entity: string;
      };
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
    createdAt: string;
    updatedAt: string;
  };
  supplier: any | null;
  partnerType: 'consignee' | 'supplier';
  status: 'unpaid' | 'paid' | 'partial' | 'overdue';
  dueDate: string;
  creditLimit: number;
  remainingAmount: number;
  paidAmount: number;
  originalAmount: number;
  debtType: 'receivable' | 'payable';
  createdAt: string;
  updatedAt: string;
}
