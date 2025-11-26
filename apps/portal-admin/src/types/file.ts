// File types matching backend API
export interface FileType {
  id: string;
  path: string;
}

export interface FileDto {
  id: string;
  path: string;
}

export interface FileResponseDto {
  file: FileType;
}

export interface FileUploadDto {
  file: string;
}
