export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: string | number;
};

export type AuthMeResponse = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
};
