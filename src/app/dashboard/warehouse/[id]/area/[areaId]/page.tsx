import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
    <div className='container mx-auto p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Chi tiết khu vực {areaId}</h1>
      <p className='text-muted-foreground'>Kho: {warehouseId}</p>
      <div className='mt-6'>
        <p>Trang này đang được phát triển...</p>
      </div>
    </div>
  );
}
