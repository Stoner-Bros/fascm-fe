import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WarehouseInventoryDetail } from '@/features/warehouse/components/warehouse-inventory-detail';

export const metadata: Metadata = {
  title: 'Chi tiết tồn kho | FASCM',
  description: 'Quản lý chi tiết tồn kho cho kho hàng'
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WarehouseInventoryPage({ params }: PageProps) {
  const { id: warehouseId } = await params;

  // Validate warehouse ID
  if (!warehouseId || warehouseId === 'undefined') {
    notFound();
  }

  return <WarehouseInventoryDetail />;
}
