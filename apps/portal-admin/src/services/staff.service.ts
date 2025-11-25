import { fetchJSON } from '@/lib/client';
import type {
  Staff,
  CreateStaffDto,
  UpdateStaffDto,
  FindAllStaffsDto
} from '@/types/staff';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/staffs';

export async function createStaff(body: CreateStaffDto) {
  return fetchJSON<Staff>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchStaffs({
  page = 1,
  limit = 10,
  warehouseId,
  search
}: FindAllStaffsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (warehouseId) params.set('warehouseId', warehouseId);
  if (search) params.set('search', search);

  return fetchJSON<InfinityPaginationResponse<Staff>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchStaffById(id: string) {
  return fetchJSON<Staff>(`${BASE_PATH}/${id}`);
}

export async function updateStaff(id: string, body: UpdateStaffDto) {
  return fetchJSON<Staff>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteStaff(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
