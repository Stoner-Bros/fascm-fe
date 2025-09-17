import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-4 text-2xl font-bold'>
        Quản lý tồn kho - Khu vực {areaId}
      </h1>
      <p className='text-muted-foreground'>Kho: {warehouseId}</p>
      <div className='mt-6'>
        <p>Trang này đang được phát triển...</p>
      </div>
    </div>
  );
}
