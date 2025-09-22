import PageContainer from '@/components/layout/page-container';
import { TruckManagement } from '@/features/delivery/components/truck-management';

export default function TruckPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý xe tải</h2>
        </div>
        <TruckManagement />
      </div>
    </PageContainer>
  );
}
