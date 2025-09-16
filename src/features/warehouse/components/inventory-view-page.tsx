import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconPackage,
  IconAlertTriangle,
  IconBarcode,
  IconTemperature,
  IconClockHour4,
  IconSearch,
  IconFilter,
  IconDownload
} from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';
import InventoryListingPage from './inventory-listing';

interface InventoryViewPageProps {}

export function InventoryViewPage({}: InventoryViewPageProps) {
  // Mock data cho các thống kê nhanh
  const inventoryStats = {
    totalProducts: 1247,
    lowStock: 23,
    expiringSoon: 8,
    outOfStock: 5
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header với các thao tác nhanh */}
        <div className='flex items-start justify-between'>
          <Heading
            title='Quản lý tồn kho'
            description='Theo dõi và quản lý tồn kho nông sản trong kho'
          />
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <IconBarcode className='mr-2 h-4 w-4' /> Quét mã vạch
            </Button>
            <Button variant='outline' size='sm'>
              <IconDownload className='mr-2 h-4 w-4' /> Xuất báo cáo
            </Button>
            <Link
              href='/dashboard/warehouse/inventory/new'
              className={cn(buttonVariants(), 'text-xs md:text-sm')}
            >
              <IconPlus className='mr-2 h-4 w-4' /> Thêm sản phẩm
            </Link>
          </div>
        </div>
        <Separator />

        {/* Thống kê nhanh */}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng sản phẩm
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {inventoryStats.totalProducts.toLocaleString()}
              </div>
              <p className='text-muted-foreground text-xs'>Đang quản lý</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Sắp hết hàng
              </CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {inventoryStats.lowStock}
              </div>
              <p className='text-muted-foreground text-xs'>Cần bổ sung</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sắp hết hạn</CardTitle>
              <IconClockHour4 className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {inventoryStats.expiringSoon}
              </div>
              <p className='text-muted-foreground text-xs'>Trong 2 ngày</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Hết hàng</CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {inventoryStats.outOfStock}
              </div>
              <p className='text-muted-foreground text-xs'>Cần nhập ngay</p>
            </CardContent>
          </Card>
        </div>

        {/* Bảng danh sách inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tồn kho</CardTitle>
            <CardDescription>
              Quản lý chi tiết từng sản phẩm nông sản trong kho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <DataTableSkeleton
                  columnCount={5}
                  rowCount={8}
                  filterCount={2}
                />
              }
            >
              <InventoryListingPage />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
