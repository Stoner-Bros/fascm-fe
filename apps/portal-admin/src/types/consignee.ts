import type { AccountUserPayload } from './common';

export type Consignee = {
  id: string;
  contact?: string;
  taxCode?: string;
  address?: string;
  certificate?: string;
  qrCode?: string;
  organizationName?: string;
  representativeName?: string;
  user?: {
    id?: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type CreateConsigneeDto = {
  contact: string;
  taxCode: string;
  address: string;
  certificate?: string;
  qrCode?: string;
  organizationName: string;
  representativeName: string;
  user: AccountUserPayload;
};

export type UpdateConsigneeDto = Partial<CreateConsigneeDto>;

export type FindAllConsigneesDto = {
  page?: number;
  limit?: number;
  search?: string;
};
