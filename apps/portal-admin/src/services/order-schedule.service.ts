import { fetchJSON } from '@/lib/client';
import type { OrderSchedule, UpdateOrderScheduleDto } from '@/types/order';

export async function updateOrderSchedule(
  id: string,
  body: UpdateOrderScheduleDto
) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function fetchOrderScheduleById(id: string) {
  return fetchJSON<OrderSchedule>(`/order-schedules/${id}`);
}
