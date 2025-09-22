import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Quét mã vạch | FASCM',
  description: 'Quét mã vạch sản phẩm trong kho'
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WarehouseBarcodeScannerPage({
  params
}: PageProps) {
  const { id: warehouseId } = await params;

  // Validate warehouse ID
  if (!warehouseId || warehouseId === 'undefined') {
    notFound();
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Quét mã vạch</h1>
      <p className='text-muted-foreground'>Kho: {warehouseId}</p>
      <div className='mt-6'>
        <p>Trang này đang được phát triển...</p>
      </div>
    </div>
  );
}
