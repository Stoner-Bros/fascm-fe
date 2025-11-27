import PageContainer from '@/components/layout/page-container';
import { TruckManagement } from '@/features/delivery/components/truck-management';
import { useTranslations } from 'next-intl';

export default function TruckPage() {
  const t = useTranslations('Truck');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
        </div>
        <TruckManagement />
      </div>
    </PageContainer>
  );
}
