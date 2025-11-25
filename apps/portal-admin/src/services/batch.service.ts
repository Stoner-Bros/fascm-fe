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
  search,
  importTicketId,
  productId
}: FindAllBatchesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search) params.set('search', search);
  if (importTicketId) params.set('importTicketId', importTicketId);
  if (productId) params.set('productId', productId);

  return fetchJSON<InfinityPaginationResponse<Batch>>(
    `${BASE_PATH}?${params.toString()}`
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
