export type OrderDetail = {
  id: string;
  quantity?: number;
  unit?: string;
  product?: {
    id: string;
    name?: string;
  };
  order?: {
    id: string;
  };
};

export type FindAllOrderDetailsDto = {
  page?: number;
  limit?: number;
  search?: string;
  orderId?: string;
};
