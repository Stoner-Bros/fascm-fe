import { FileType } from '@/types/file';
import { fetchJSON } from '../lib/client';

/**
 * Upload a single file to the backend
 * @param file - File object to upload
 * @returns Promise with uploaded file metadata
 */
export async function uploadFile(file: File): Promise<FileType> {
  const formData = new FormData();
  formData.append('file', file);

  return fetchJSON<FileType>('/files/upload', {
    method: 'POST',
    body: formData,
    file: true
  });
}
