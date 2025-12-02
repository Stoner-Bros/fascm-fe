import { fetchJSON } from '../lib/client';
import type { Consignee, UpdateConsigneeDto } from '@/types/consignee';

export async function fetchMyConsignee() {
  return fetchJSON<Consignee | null>('/consignees/mine');
}

export async function updateConsignee(id: string, body: UpdateConsigneeDto) {
  return fetchJSON<Consignee>(`/consignees/${id}`, {
    method: 'PATCH',
    body
  });
}
