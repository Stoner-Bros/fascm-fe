import { fetchJSON } from '@/lib/client';
import type {
  Consignee,
  CreateConsigneeDto,
  UpdateConsigneeDto,
  FindAllConsigneesDto
} from '@/types/consignee';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/consignees';

export async function createConsignee(body: CreateConsigneeDto) {
  return fetchJSON<Consignee>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchConsignees({
  page = 1,
  limit = 10,
  search
}: FindAllConsigneesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search) params.set('search', search);

  return fetchJSON<InfinityPaginationResponse<Consignee>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchConsigneeById(id: string) {
  return fetchJSON<Consignee>(`${BASE_PATH}/${id}`);
}

export async function updateConsignee(id: string, body: UpdateConsigneeDto) {
  return fetchJSON<Consignee>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteConsignee(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
