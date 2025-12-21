import { fetchJSON } from '@/lib/client';
import type {
  SupplierRegisterRequest,
  ConsigneeRegisterRequest
} from '@/types/register';
import type { Supplier } from '@/types/supplier';
import type { Consignee } from '@/types/consignee';

/**
 * Register a new supplier account
 * POST /api/v1/suppliers
 */
export async function registerSupplier(
  data: SupplierRegisterRequest
): Promise<Supplier> {
  return fetchJSON<Supplier>('/suppliers', {
    method: 'POST',
    body: data,
    auth: false
  });
}

/**
 * Register a new consignee account
 * POST /api/v1/consignees
 */
export async function registerConsignee(
  data: ConsigneeRegisterRequest
): Promise<Consignee> {
  return fetchJSON<Consignee>('/consignees', {
    method: 'POST',
    body: data,
    auth: false
  });
}
