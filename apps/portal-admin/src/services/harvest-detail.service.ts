import { fetchJSON } from '@/lib/client';
import type {
  AcceptPriceDto,
  UpdateFinalPriceDto
} from '../types/harvest-schedule';

export async function updatePrice(
  id: string,
  body: UpdateFinalPriceDto
): Promise<any> {
  return fetchJSON<any>(`/harvest-details/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function acceptPrice(
  id: string,
  body: AcceptPriceDto
): Promise<any> {
  return fetchJSON<any>(`/harvest-details/${id}/final-unit-price-accepted`, {
    method: 'PATCH',
    body
  });
}
