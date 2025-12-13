import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();
  const t = useTranslations('Orders.detail.empty');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col items-center justify-center py-20'>
        <p className='text-muted-foreground mb-4 text-lg'>{t('title')}</p>
        <Button variant='outline' onClick={() => router.back()}>
          {t('back')}
        </Button>
      </div>
    </PageContainer>
  );
}
