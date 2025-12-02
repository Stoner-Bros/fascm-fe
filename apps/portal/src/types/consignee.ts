export type Consignee = {
  contact?: string;
  taxCode?: string;
  address?: string;
  certificate?: string;
  qrCode?: string;
  organizationName?: string;
  representativeName?: string;
  user: {
    id: number;
    email: string;
    provider: string;
    socialId: string;
    firstName: string;
    lastName: string;
    photo: {
      id: string;
      path: string;
    };
    role: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateConsigneeDto = {
  contact?: string;
  taxCode?: string;
  address?: string;
  certificate?: string;
  qrCode?: string;
  organizationName?: string;
  representativeName?: string;
  user: {
    id: string;
  };
};
