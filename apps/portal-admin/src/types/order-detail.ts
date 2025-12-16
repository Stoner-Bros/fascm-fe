export type OrderDetail = {
  id: string;
  amount?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  orderDetailSelections?: Array<{
    id: string;
    quantity?: number | null;
    unitPrice?: number | null;
    unit?: string | null;
    batch?: {
      id: string;
      costPrice?: number | null;
      quantity?: number | null;
      currentQuantity?: number | null;
      unit?: string | null;
      batchCode?: string | null;
      expiredAt?: string | Date | null;
      createdAt?: string | Date | null;
      updatedAt?: string | Date | null;
    } | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
  }> | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export type FindAllOrderDetailsDto = {
  page?: number;
  limit?: number;
  search?: string;
  orderId?: string;
};
