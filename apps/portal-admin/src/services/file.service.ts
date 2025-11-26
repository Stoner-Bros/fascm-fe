import { fetchJSON, getApiBase } from '../lib/client';
import { getAccessToken } from './auth.service';
import type { FileType, FileResponseDto } from '../types/file';

/**
 * Upload a single file to the backend
 * @param file - File object to upload
 * @returns Promise with uploaded file metadata
 */
export async function uploadFile(file: File): Promise<FileType> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${getApiBase()}/files/upload`;
  const accessToken = getAccessToken();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: formData
  });

  if (!res.ok) {
    let details: unknown = undefined;
    try {
      details = await res.json();
    } catch {}
    throw new Error(
      `File upload failed ${res.status}: ${res.statusText}` +
        (details ? ` - ${JSON.stringify(details)}` : '')
    );
  }

  const data = (await res.json()) as FileResponseDto;
  return data.file;
}

/**
 * Upload multiple files to the backend
 * @param files - Array of File objects to upload
 * @returns Promise with array of uploaded file metadata
 */
export async function uploadFiles(files: File[]): Promise<FileType[]> {
  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
}

/**
 * Get file metadata by ID
 * @param id - File ID
 * @returns Promise with file metadata
 */
export async function getFileById(id: string): Promise<FileType | null> {
  try {
    return await fetchJSON<FileType>(`/files/${id}`, {
      method: 'GET'
    });
  } catch {
    return null;
  }
}

/**
 * Get multiple files metadata by IDs
 * @param ids - Array of file IDs
 * @returns Promise with array of file metadata
 */
export async function getFilesByIds(ids: string[]): Promise<FileType[]> {
  try {
    return await fetchJSON<FileType[]>('/files/batch', {
      method: 'POST',
      body: { ids }
    });
  } catch {
    return [];
  }
}

/**
 * Get download URL for a file
 * @param fileId - File ID
 * @returns Full URL to download the file
 */
export function getFileDownloadUrl(fileId: string): string {
  return `${getApiBase()}/files/${fileId}`;
}

/**
 * Get download URL from file path
 * @param path - File path
 * @returns Full URL to download the file
 */
export function getFileUrlFromPath(path: string): string {
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, construct URL with backend domain
  return `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
}
