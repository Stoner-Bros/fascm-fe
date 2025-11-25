'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CategoryTable } from '@/features/categories';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function CategoriesTablePage() {
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Categories'
            description='Manage product categories with advanced filtering and sorting'
          />
          <Link href='/dashboard/category/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Add New Category
            </Button>
          </Link>
        </div>
        <Separator />
        <CategoryTable />
      </div>
    </PageContainer>
  );
}
