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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconBarcode,
  IconPackage,
  IconTruck,
  IconClockHour4,
  IconUser,
  IconCalendar,
  IconFilter,
  IconDownload,
  IconMapPin,
  IconGps,
  IconTemperature,
  IconDroplet,
  IconRoute
} from '@tabler/icons-react';
import Link from 'next/link';

interface StockViewPageProps {}

export function StockViewPage({}: StockViewPageProps) {
  // Mock data cho stock movements
  const stockStats = {
    todayImport: 45,
    todayExport: 32,
    pendingImport: 12,
    pendingExport: 8
  };

  // Mock data cho tracking vận chuyển
  const activeDeliveries = [
    {
      id: '1',
      orderId: 'ORD-001',
      type: 'export', // xuất hàng
      vehicle: 'Xe tải 001',
      driver: 'Nguyễn Văn A',
      destination: 'Siêu thị BigC Thăng Long',
      progress: 65,
      status: 'Đang vận chuyển',
      currentLocation: 'Đường Nguyễn Trãi, Q.Thanh Xuân',
      estimatedArrival: '14:30',
      temperature: 16.8,
      humidity: 62,
      items: [
        { name: 'Cà chua', quantity: 50, unit: 'kg' },
        { name: 'Táo', quantity: 30, unit: 'kg' }
      ]
    },
    {
      id: '2',
      orderId: 'ORD-002',
      type: 'export', // xuất hàng
      vehicle: 'Xe tải 002',
      driver: 'Trần Văn B',
      destination: 'Chợ Hà Đông',
      progress: 25,
      status: 'Đang vận chuyển',
      currentLocation: 'Kho hàng - Chuẩn bị xuất phát',
      estimatedArrival: '15:45',
      temperature: 17.2,
      humidity: 58,
      items: [
        { name: 'Gạo', quantity: 100, unit: 'kg' },
        { name: 'Đậu xanh', quantity: 25, unit: 'kg' }
      ]
    },
    {
      id: '3',
      orderId: 'IMP-001',
      type: 'import', // nhập hàng
      vehicle: 'Xe tải 003',
      driver: 'Lê Thị C',
      destination: 'Kho hàng chính',
      progress: 80,
      status: 'Sắp đến nơi',
      currentLocation: 'Đường Xuân Thủy, Q.Cầu Giấy',
      estimatedArrival: '14:15',
      temperature: 16.5,
      humidity: 65,
      items: [
        { name: 'Xà lách tươi', quantity: 200, unit: 'kg' },
        { name: 'Cải thảo', quantity: 150, unit: 'kg' }
      ]
    }
  ];

  const recentMovements = [
    {
      id: 1,
      date: '15/01/2024',
      time: '10:30',
      item: 'Cà chua cherry',
      type: 'inbound',
      quantity: 150,
      unit: 'kg',
      staff: 'Nguyễn Văn A',
      status: 'completed',
      location: 'Khu A-01'
    },
    {
      id: 2,
      date: '15/01/2024',
      time: '09:45',
      item: 'Rau xà lách',
      type: 'outbound',
      quantity: 80,
      unit: 'kg',
      staff: 'Trần Thị B',
      status: 'completed',
      location: 'Khu B-03'
    },
    {
      id: 3,
      date: '15/01/2024',
      time: '09:15',
      item: 'Táo Fuji',
      type: 'inbound',
      quantity: 200,
      unit: 'kg',
      staff: 'Lê Văn C',
      status: 'pending',
      location: 'Khu C-02'
    },
    {
      id: 4,
      date: '15/01/2024',
      time: '08:30',
      item: 'Cải thảo',
      type: 'outbound',
      quantity: 120,
      unit: 'kg',
      staff: 'Phạm Thị D',
      status: 'completed',
      location: 'Khu A-05'
    }
  ];

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
            <Button variant='outline' size='sm'>
              <IconBarcode className='mr-2 h-4 w-4' /> Quét mã vạch
            </Button>
            <Button variant='outline' size='sm'>
              <IconDownload className='mr-2 h-4 w-4' /> Xuất báo cáo
            </Button>
            <Link
              href='/dashboard/warehouse/stock/import'
              className={cn(
                buttonVariants({ variant: 'default' }),
                'text-xs md:text-sm'
              )}
            >
              <IconTrendingUp className='mr-2 h-4 w-4' /> Nhập kho
            </Link>
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
        <Card>
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
                  className='flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50'
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
        </Card>
      </div>
    </PageContainer>
  );
}
