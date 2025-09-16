'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { InventoryHistory } from './inventory-history';

export function InventoryHistoryDemo() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <Link href='/dashboard/warehouse/inventory'>
                <Button variant='outline' size='sm'>
                  <IconArrowLeft className='mr-2 h-4 w-4' /> Quay lại
                </Button>
              </Link>
            </div>
            <Heading
              title='Lịch sử nhập xuất kho'
              description='Chi tiết các giao dịch nhập xuất kho của sản phẩm'
            />
          </div>
        </div>
        <Separator />

        {/* Inventory History Component */}
        <InventoryHistory productId='1' productName='Cà chua bi' />
      </div>
    </PageContainer>
  );
}
