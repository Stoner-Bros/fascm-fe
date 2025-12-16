import { Card, CardContent } from '@/components/ui/card';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { getDaysUntilDue } from '../utils';
import { formatDate } from '../utils/formatting';
import type { Debt } from '@/types/debt';

interface DebtAlertBannerProps {
  debt: Debt;
}

export function DebtAlertBanner({ debt }: DebtAlertBannerProps) {
  const t = useTranslations('Debt.alertBanner');
  const daysUntilDue = getDaysUntilDue(debt.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  if (isOverdue) {
    return (
      <Card className='border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 dark:border-red-900 dark:from-red-950/30 dark:to-red-900/20'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/50'>
              <IconAlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-red-900 dark:text-red-100'>
                {t('overdueTitle')}
              </h3>
              <p className='text-sm text-red-700 dark:text-red-300'>
                {t('overdueMessage', { days: Math.abs(daysUntilDue) })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isDueSoon) {
    return (
      <Card className='border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:border-orange-900 dark:from-orange-950/30 dark:to-orange-900/20'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='rounded-full bg-orange-100 p-3 dark:bg-orange-900/50'>
              <IconAlertTriangle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-orange-900 dark:text-orange-100'>
                {t('dueSoonTitle')}
              </h3>
              <p className='text-sm text-orange-700 dark:text-orange-300'>
                {t('dueSoonMessage', {
                  days: daysUntilDue,
                  date: debt.dueDate ? formatDate(debt.dueDate) : 'N/A'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:border-blue-900 dark:from-blue-950/30 dark:to-blue-900/20'>
      <CardContent className='p-6'>
        <div className='flex items-center gap-4'>
          <div className='rounded-full bg-blue-100 p-3 dark:bg-blue-900/50'>
            <IconCalendar className='h-6 w-6 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
              {t('infoTitle')}
            </h3>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              {t('infoMessage', {
                days: daysUntilDue,
                date: debt.dueDate ? formatDate(debt.dueDate) : 'N/A'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
