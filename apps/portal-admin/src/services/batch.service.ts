import { fetchJSON } from '@/lib/client';
import type {
  Batch,
  CreateBatchDto,
  UpdateBatchDto,
  FindAllBatchesDto
} from '@/types/batch';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/batches';

export async function createBatch(body: CreateBatchDto) {
  return fetchJSON<Batch>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchBatches({
  page = 1,
  limit = 10,
  importTicketId,
  productId,
  areaId
}: FindAllBatchesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (importTicketId) params.set('importTicketId', importTicketId);
  if (productId) params.set('productId', productId);
  if (areaId) params.set('areaId', areaId);

  return fetchJSON<InfinityPaginationResponse<Batch>>(
    `${BASE_PATH}/filter/by-params?${params.toString()}`
  );
}

export async function fetchBatchesGroupedByWeight({
  importTicketId,
  productId,
  areaId
}: Omit<FindAllBatchesDto, 'page' | 'limit' | 'search'> = {}) {
  const params = new URLSearchParams();

  if (importTicketId) params.set('importTicketId', importTicketId);
  if (productId) params.set('productId', productId);
  if (areaId) params.set('areaId', areaId);

  return fetchJSON<any[]>(
    `${BASE_PATH}/grouped/by-weight?${params.toString()}`
  );
}

export async function fetchBatchById(id: string) {
  return fetchJSON<Batch>(`${BASE_PATH}/${id}`);
}

export async function updateBatch(id: string, body: UpdateBatchDto) {
  return fetchJSON<Batch>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteBatch(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
