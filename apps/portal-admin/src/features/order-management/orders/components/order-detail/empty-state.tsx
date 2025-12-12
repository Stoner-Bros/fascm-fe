import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col items-center justify-center py-20'>
        <p className='text-muted-foreground mb-4 text-lg'>
          Không tìm thấy lịch giao hàng
        </p>
        <Button variant='outline' onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    </PageContainer>
  );
}
