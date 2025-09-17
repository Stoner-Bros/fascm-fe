import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WarehouseDetailPage from '@/features/warehouse/components/warehouse-detail-page';

export const metadata: Metadata = {
  title: 'Chi tiết kho | FASCM',
  description: 'Thông tin chi tiết kho hàng và các khu vực'
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id: warehouseId } = await params;

  // Validate warehouse ID
  if (!warehouseId || warehouseId === 'undefined') {
    notFound();
  }

  return <WarehouseDetailPage warehouseId={warehouseId} />;
}
