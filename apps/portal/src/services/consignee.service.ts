import { fetchJSON } from '../lib/client';
import type { Consignee } from '@/types/consignee';

export async function fetchMyConsignee() {
  return fetchJSON<Consignee | null>('/consignees/mine');
}

export async function updateConsignee(
  id: string,
  body: Partial<
    Pick<
      Consignee,
      | 'contact'
      | 'address'
      | 'taxCode'
      | 'organizationName'
      | 'representativeName'
      | 'certificate'
      | 'qrCode'
    >
  >
) {
  return fetchJSON<Consignee>(`/consignees/${id}`, { method: 'PATCH', body });
}
