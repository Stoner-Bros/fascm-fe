import { fetchJSON } from './client';

export type OrderSchedule = {
  id: string;
  description?: string | null;
  status?: string | null;
  orderDate?: string | Date | null;
  consignee?: { id: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateOrderScheduleRequest = {
  description?: string | null;
  status?: string | null;
  orderDate?: string | Date | null;
  consignee?: { id: string } | null;
};

export async function createOrderSchedule(body: CreateOrderScheduleRequest) {
  return fetchJSON<OrderSchedule>('/order-schedules', { method: 'POST', body });
}
