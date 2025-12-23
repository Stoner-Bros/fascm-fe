export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

export type AccountUserPayload =
  | {
      id: number;
    }
  | {
      id: number;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
