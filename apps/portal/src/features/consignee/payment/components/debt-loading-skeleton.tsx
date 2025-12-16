import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DebtLoadingSkeleton() {
  return (
    <div className='w-full flex-1 space-y-6'>
      {/* Header Skeleton */}
      <div>
        <Skeleton className='h-9 w-64' />
        <Skeleton className='mt-2 h-5 w-96' />
      </div>

      {/* Alert Banner Skeleton */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='h-4 w-full' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Card Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <Skeleton className='h-6 w-24 rounded-full' />
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Highlight Section */}
          <Skeleton className='h-32 w-full rounded-lg' />

          {/* Summary Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-24 w-full rounded-lg' />
            ))}
          </div>

          {/* Additional Sections */}
          <Skeleton className='h-40 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
        </CardContent>
      </Card>
    </div>
  );
}
