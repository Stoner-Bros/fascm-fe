import PageContainer from '@/components/layout/page-container';

export function LoadingState() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col items-center justify-center py-20'>
        <div className='border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
        <p className='text-muted-foreground'>Đang tải dữ liệu...</p>
      </div>
    </PageContainer>
  );
}
