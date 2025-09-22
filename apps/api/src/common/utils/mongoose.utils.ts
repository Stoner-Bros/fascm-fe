import { Types } from 'mongoose';
import { CustomBadRequestException } from '../exceptions/custom-exceptions';

/**
 * Kiểm tra nếu chuỗi là MongoDB ObjectId hợp lệ
 * @param id - Chuỗi cần kiểm tra
 * @returns boolean
 */
export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

/**
 * Kiểm tra nếu ID hợp lệ, nếu không thì ném lỗi 400
 * @param id - ID cần kiểm tra
 * @param entityName - Tên thực thể để hiển thị trong thông báo lỗi
 * @throws CustomBadRequestException nếu ID không hợp lệ
 */
export const validateObjectId = (id: string, entityName = 'entity'): void => {
  if (!isValidObjectId(id)) {
    throw new CustomBadRequestException(
      `Invalid ${entityName} ID format: ${id}`,
      'invalidIdFormat',
    );
  }
};
