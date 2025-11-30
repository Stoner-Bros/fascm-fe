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

export type AuthMeResponse = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
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
