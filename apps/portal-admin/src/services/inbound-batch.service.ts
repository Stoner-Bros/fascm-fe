import { fetchJSON } from '@/lib/client';
import type {
  CreateInboundBatchDto,
  FindAllInboundBatchesDto,
  InboundBatch,
  UpdateInboundBatchDto
} from '@/types/inbound-batch';
import type { InfinityPaginationResponse } from '@/types/common';
import { useAuthStore } from '@/stores/auth.store';

const BASE_PATH = '/inbound-batches';

export async function fetchInboundBatches({
  page = 1,
  limit = 10
}: FindAllInboundBatchesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const warehouseId = useAuthStore.getState()?.fullInfo?.warehouse?.id;
  if (warehouseId) params.set('warehouseId', warehouseId);

  return fetchJSON<InfinityPaginationResponse<InboundBatch>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchInboundBatchById(id: string) {
  return fetchJSON<InboundBatch>(`${BASE_PATH}/${id}`);
}

export async function createInboundBatch(body: CreateInboundBatchDto) {
  return fetchJSON<InboundBatch>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function updateInboundBatch(
  id: string,
  body: UpdateInboundBatchDto
) {
  return fetchJSON<InboundBatch>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteInboundBatch(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
