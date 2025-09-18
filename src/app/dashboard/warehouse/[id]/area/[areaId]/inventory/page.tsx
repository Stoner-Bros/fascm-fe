import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AreaInventoryView from '@/features/warehouse/components/area-inventory-view';

export const metadata: Metadata = {
  title: 'Quản lý tồn kho khu vực | FASCM',
  description: 'Quản lý tồn kho cho khu vực cụ thể'
};

interface PageProps {
  params: Promise<{
    id: string;
    areaId: string;
  }>;
}

export default async function AreaInventoryPage({ params }: PageProps) {
  const { id: warehouseId, areaId } = await params;

  // Validate parameters
  if (
    !warehouseId ||
    !areaId ||
    warehouseId === 'undefined' ||
    areaId === 'undefined'
  ) {
    notFound();
  }

  return <AreaInventoryView warehouseId={warehouseId} areaId={areaId} />;
}
