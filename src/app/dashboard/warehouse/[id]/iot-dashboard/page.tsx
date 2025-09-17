import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IoTDashboard } from '@/features/warehouse/components/iot-dashboard';

export const metadata: Metadata = {
  title: 'Giám sát IoT | FASCM',
  description: 'Giám sát thiết bị IoT trong kho'
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WarehouseIoTDashboardPage({ params }: PageProps) {
  const { id: warehouseId } = await params;

  // Validate warehouse ID
  if (!warehouseId || warehouseId === 'undefined') {
    notFound();
  }

  return (
    <div className='w-full max-w-full overflow-hidden'>
      <div className='p-4 sm:p-6'>
        <IoTDashboard warehouseId={warehouseId} />
      </div>
    </div>
  );
}
