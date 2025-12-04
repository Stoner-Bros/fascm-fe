export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: string | number;
  user: any;
};

export type User = {
  id: number;
  email: string;
  provider?: string;
  socialId?: string | null;
  firstName?: string;
  lastName?: string;
  photo?: {
    id: string;
    path: string;
  } | null;
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
  deletedAt?: string | null;
};

export type AuthMeResponse = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: any;
  status?: any;
  photo?: {
    id: string;
    path: string;
  } | null;
  provider?: string;
  socialId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type AuthRegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthConfirmEmailRequest = {
  hash: string;
};

export type AuthForgotPasswordRequest = {
  email: string;
};

export type AuthResetPasswordRequest = {
  hash: string;
  password: string;
};

export type AuthUpdateRequest = {
  photo?: any;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
};

export type RefreshResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
};
