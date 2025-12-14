import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { IconArrowLeft, IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();
  const t = useTranslations('Orders');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col items-center justify-center py-12'>
        <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
        <p className='text-muted-foreground'>{t('detail.notFound')}</p>
        <Button
          variant='outline'
          onClick={() => router.push('/consignee/orders')}
          className='mt-4'
        >
          <IconArrowLeft className='mr-2 h-4 w-4' />
          {t('detail.backToOrders')}
        </Button>
      </div>
    </PageContainer>
  );
}
