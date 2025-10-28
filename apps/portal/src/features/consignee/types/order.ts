export type OrderStatus = 'pending' | 'indelivery' | 'delivered' | 'cancel';

export interface OrderItem {
  id: string;
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  consignee: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  deliveryAddress: string;
  deliveryDate: string;
  orderDate: string;
  totalAmount: number;
  notes?: string;
  trackingInfo?: {
    currentLocation?: string;
    estimatedDelivery?: string;
    deliveryProgress?: number;
  };
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface OrderSummary {
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
}
