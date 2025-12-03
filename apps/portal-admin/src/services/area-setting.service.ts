import { fetchJSON } from '@/lib/client';
import type {
  AreaSetting,
  CreateAreaSettingDto,
  UpdateAreaSettingDto,
  FindAllAreaSettingsDto
} from '@/types/area-setting';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/area-settings';

export async function createAreaSetting(body: CreateAreaSettingDto) {
  return fetchJSON<AreaSetting>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchAreaSettings({
  page = 1,
  limit = 10,
  areaId
}: FindAllAreaSettingsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (areaId) params.set('areaId', areaId);

  return fetchJSON<InfinityPaginationResponse<AreaSetting>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchAreaSettingById(id: string) {
  return fetchJSON<AreaSetting>(`${BASE_PATH}/${id}`);
}

export async function updateAreaSetting(
  id: string,
  body: UpdateAreaSettingDto
) {
  return fetchJSON<AreaSetting>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteAreaSetting(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}
