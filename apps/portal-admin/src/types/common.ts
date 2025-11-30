export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

export type AccountUserPayload =
  | {
      id: string;
    }
  | {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
