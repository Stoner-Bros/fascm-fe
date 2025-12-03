import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  IconClockHour4,
  IconTrendingDown,
  IconTrendingUp
} from '@tabler/icons-react';
import Link from 'next/link';
import { WarehouseActivitiesTable } from './warehouse-activities-table';

interface StockViewPageProps {}

export function StockViewPage({}: StockViewPageProps) {
  // Mock data cho stock movements
  const stockStats = {
    todayImport: 45,
    todayExport: 32,
    pendingImport: 12,
    pendingExport: 8
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <Heading
            title='Quản lý xuất nhập kho'
            description='Theo dõi và quản lý các hoạt động xuất nhập kho nông sản'
          />
          <div className='flex gap-2'>
            <Link
              href='/dashboard/warehouse/stock/export'
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'text-xs md:text-sm'
              )}
            >
              <IconTrendingDown className='mr-2 h-4 w-4' /> Xuất kho
            </Link>
          </div>
        </div>
        <Separator />

        {/* Thống kê nhanh */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Nhập kho hôm nay
              </CardTitle>
              <IconTrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stockStats.todayImport}
              </div>
              <p className='text-muted-foreground text-xs'>Lô hàng đã nhập</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Xuất kho hôm nay
              </CardTitle>
              <IconTrendingDown className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stockStats.todayExport}
              </div>
              <p className='text-muted-foreground text-xs'>Lô hàng đã xuất</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chờ nhập kho
              </CardTitle>
              <IconClockHour4 className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {stockStats.pendingImport}
              </div>
              <p className='text-muted-foreground text-xs'>Đang chờ xử lý</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chờ xuất kho
              </CardTitle>
              <IconClockHour4 className='h-4 w-4 text-orange-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stockStats.pendingExport}
              </div>
              <p className='text-muted-foreground text-xs'>Đang chờ xử lý</p>
            </CardContent>
          </Card>
        </div>

        {/* Bảng hoạt động gần đây */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Hoạt động xuất nhập kho gần đây</CardTitle>
            <CardDescription>
              Theo dõi chi tiết các giao dịch xuất nhập kho trong ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className='flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <div className='flex items-center space-x-4'>
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full',
                        movement.type === 'inbound'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      )}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <h4 className='font-medium'>{movement.item}</h4>
                        <Badge
                          variant={
                            movement.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {movement.status === 'completed'
                            ? 'Hoàn thành'
                            : 'Đang xử lý'}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground mt-1 flex items-center space-x-4 text-sm'>
                        <span className='flex items-center'>
                          <IconCalendar className='mr-1 h-3 w-3' />
                          {movement.date} - {movement.time}
                        </span>
                        <span className='flex items-center'>
                          <IconUser className='mr-1 h-3 w-3' />
                          {movement.staff}
                        </span>
                        <span className='flex items-center'>
                          <IconPackage className='mr-1 h-3 w-3' />
                          {movement.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div
                      className={cn(
                        'text-lg font-bold',
                        movement.type === 'inbound'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      )}
                    >
                      {movement.type === 'inbound' ? '+' : '-'}
                      {movement.quantity} {movement.unit}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      {movement.type === 'inbound' ? 'Nhập kho' : 'Xuất kho'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
        <WarehouseActivitiesTable />
      </div>
    </PageContainer>
  );
}
