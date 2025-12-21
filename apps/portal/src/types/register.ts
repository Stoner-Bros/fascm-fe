// Base user registration fields
export type UserRegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

// Supplier registration request
export type SupplierRegisterRequest = {
  contact?: string | null;
  taxCode?: string | null;
  address?: string | null;
  certificate?: string | null;
  qrCode?: string | null;
  gardenName: string;
  representativeName: string;
  user: UserRegisterDto;
};

// Consignee registration request
export type ConsigneeRegisterRequest = {
  contact?: string | null;
  taxCode?: string | null;
  address?: string | null;
  certificate?: string | null;
  qrCode?: string | null;
  organizationName?: string | null;
  representativeName?: string | null;
  user: UserRegisterDto;
};

export type RegisterType = 'supplier' | 'consignee';
