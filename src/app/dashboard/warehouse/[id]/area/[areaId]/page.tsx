import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AreaDetailView from '@/features/warehouse/components/area-detail-view';
import PageContainer from '@/components/layout/page-container';

export const metadata: Metadata = {
  title: 'Chi tiết khu vực | FASCM',
  description: 'Thông tin chi tiết khu vực trong kho'
};

interface PageProps {
  params: Promise<{
    id: string;
    areaId: string;
  }>;
}

export default async function AreaDetailPage({ params }: PageProps) {
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

  return (
    <PageContainer scrollable>
      <AreaDetailView warehouseId={warehouseId} areaId={areaId} />
    </PageContainer>
  );
}
