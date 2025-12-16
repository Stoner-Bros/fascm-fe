import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface DebtErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function DebtError({ error, onRetry }: DebtErrorProps) {
  return (
    <Card className='border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'>
      <CardContent className='p-6'>
        <div className='flex flex-col items-center justify-center gap-4 text-center'>
          <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/50'>
            <IconAlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
          </div>
          <div>
            <h3 className='mb-2 font-semibold text-red-900 dark:text-red-100'>
              Không thể tải thông tin nợ
            </h3>
            <p className='text-sm text-red-700 dark:text-red-300'>
              {error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
            </p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant='outline'
              className='border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30'
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Thử lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
