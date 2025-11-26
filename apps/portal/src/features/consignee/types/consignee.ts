export type Consignee = {
  id: string;
  contact?: string | null;
  taxCode?: string | null;
  address?: string | null;
  certificate?: string | null;
  qrCode?: string | null;
  organizationName?: string | null;
  representativeName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
