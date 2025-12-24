import { fetchJSON } from '@/lib/client';
import type {
  DeliveryStaff,
  CreateDeliveryStaffDto,
  UpdateDeliveryStaffDto,
  FindAllDeliveryStaffsDto
} from '@/types/delivery-staff';
import type { InfinityPaginationResponse } from '@/types/common';
import { getCookie } from '@/lib/cookie';

const BASE_PATH = '/delivery-staffs';

export async function createDeliveryStaff(body: CreateDeliveryStaffDto) {
  return fetchJSON<DeliveryStaff>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchDeliveryStaffs({
  page = 1,
  limit = 10,
  search
}: FindAllDeliveryStaffsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const warehouseId = getCookie('warehouseId');
  if (warehouseId) params.set('warehouseId', warehouseId);
  if (search) params.set('search', search);

  return fetchJSON<InfinityPaginationResponse<DeliveryStaff>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchDeliveryStaffById(id: string) {
  return fetchJSON<DeliveryStaff>(`${BASE_PATH}/${id}`);
}

export async function updateDeliveryStaff(
  id: string,
  body: UpdateDeliveryStaffDto
) {
  return fetchJSON<DeliveryStaff>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteDeliveryStaff(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
