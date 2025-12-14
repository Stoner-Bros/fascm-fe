'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CategoryTable } from '@/features/categories';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CategoriesTablePage() {
  const t = useTranslations('Category');
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('list.title')}
            description={t('tablePage.description')}
          />
          <Link href='/dashboard/category/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              {t('list.new')}
            </Button>
          </Link>
        </div>
        <Separator />
        <CategoryTable />
      </div>
    </PageContainer>
  );
}
