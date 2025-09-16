import PageContainer from '@/components/layout/page-container';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconPackage,
  IconAlertTriangle,
  IconTemperature,
  IconDroplet,
  IconTruck,
  IconPlus,
  IconEye,
  IconBarcode,
  IconClockHour4,
  IconTrendingUp,
  IconTrendingDown
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface WarehouseOverviewPageProps {}

export function WarehouseOverviewPage({}: WarehouseOverviewPageProps) {
  // Mock data - trong thực tế sẽ fetch từ API
  const warehouseStats = {
    totalItems: 1247,
    lowStockItems: 23,
    expiringSoon: 8,
    outOfStock: 5,
    todayimport: 45,
    todayexport: 32,
    warehouseCapacity: 85,
    temperature: 4.2,
    humidity: 65,
    airQuality: 'Good'
  };

  const recentActivities = [
    {
      id: 1,
      type: 'import',
      item: 'Cà chua cherry',
      quantity: 150,
      time: '10:30 AM',
      staff: 'Nguyễn Văn A'
    },
    {
      id: 2,
      type: 'export',
      item: 'Rau xà lách',
      quantity: 80,
      time: '09:45 AM',
      staff: 'Trần Thị B'
    },
    {
      id: 3,
      type: 'quality_check',
      item: 'Táo Fuji',
      quantity: 200,
      time: '09:15 AM',
      staff: 'Lê Văn C'
    },
    {
      id: 4,
      type: 'import',
      item: 'Cải thảo',
      quantity: 120,
      time: '08:30 AM',
      staff: 'Phạm Thị D'
    }
  ];

  const criticalAlerts = [
    {
      id: 1,
      type: 'temperature',
      message: 'Khu vực A2 nhiệt độ cao bất thường (7.2°C)',
      severity: 'high'
    },
    {
      id: 2,
      type: 'expiry',
      message: '8 sản phẩm sắp hết hạn trong 2 ngày',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'stock',
      message: '23 sản phẩm sắp hết hàng',
      severity: 'low'
    }
  ];

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <Heading
            title='Tổng quan kho hàng'
            description='Giám sát và quản lý toàn bộ hoạt động kho nông sản'
          />
          <div className='flex gap-2'>
            <Link
              href='/dashboard/warehouse/inventory/new'
              className={cn(buttonVariants(), 'text-xs md:text-sm')}
            >
              <IconPlus className='mr-2 h-4 w-4' /> Nhập hàng
            </Link>
            <Link
              href='/dashboard/warehouse/stock/new'
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'text-xs md:text-sm'
              )}
            >
              <IconTruck className='mr-2 h-4 w-4' /> Xuất hàng
            </Link>
          </div>
        </div>
        <Separator />

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className='border-orange-200 bg-orange-50'>
            <CardHeader>
              <CardTitle className='flex items-center text-orange-800'>
                <IconAlertTriangle className='mr-2 h-5 w-5' />
                Cảnh báo quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className='flex items-center justify-between rounded border bg-white p-2'
                  >
                    <span className='text-sm'>{alert.message}</span>
                    <Badge
                      variant={
                        alert.severity === 'high'
                          ? 'destructive'
                          : alert.severity === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {alert.severity === 'high'
                        ? 'Cao'
                        : alert.severity === 'medium'
                          ? 'Trung bình'
                          : 'Thấp'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng sản phẩm
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {warehouseStats.totalItems.toLocaleString()}
              </div>
              <p className='text-muted-foreground text-xs'>
                <IconTrendingUp className='mr-1 inline h-3 w-3' />
                +12% so với tháng trước
              </p>
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
                {warehouseStats.lowStockItems}
              </div>
              <p className='text-muted-foreground text-xs'>Cần bổ sung ngay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sắp hết hạn</CardTitle>
              <IconClockHour4 className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {warehouseStats.expiringSoon}
              </div>
              <p className='text-muted-foreground text-xs'>Trong 2 ngày tới</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Công suất kho
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {warehouseStats.warehouseCapacity}%
              </div>
              <Progress
                value={warehouseStats.warehouseCapacity}
                className='mt-2'
              />
            </CardContent>
          </Card>
        </div>

        {/* Environmental Monitoring */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Nhiệt độ trung bình
              </CardTitle>
              <IconTemperature className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {warehouseStats.temperature}°C
              </div>
              <p className='text-muted-foreground text-xs'>Lý tưởng: 2-6°C</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Độ ẩm</CardTitle>
              <IconDroplet className='h-4 w-4 text-cyan-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-cyan-600'>
                {warehouseStats.humidity}%
              </div>
              <p className='text-muted-foreground text-xs'>Lý tưởng: 60-70%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chất lượng không khí
              </CardTitle>
              <IconEye className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {warehouseStats.airQuality}
              </div>
              <p className='text-muted-foreground text-xs'>Giám sát liên tục</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activities & Recent Activities */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động hôm nay</CardTitle>
              <CardDescription>
                Tổng quan nhập xuất kho trong ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
                  <div className='flex items-center'>
                    <IconTrendingUp className='mr-2 h-5 w-5 text-green-600' />
                    <span className='font-medium'>Nhập kho</span>
                  </div>
                  <span className='text-2xl font-bold text-green-600'>
                    {warehouseStats.todayimport}
                  </span>
                </div>
                <div className='flex items-center justify-between rounded-lg bg-blue-50 p-3'>
                  <div className='flex items-center'>
                    <IconTrendingDown className='mr-2 h-5 w-5 text-blue-600' />
                    <span className='font-medium'>Xuất kho</span>
                  </div>
                  <span className='text-2xl font-bold text-blue-600'>
                    {warehouseStats.todayexport}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các giao dịch mới nhất trong kho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-center justify-between rounded border p-2'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          activity.type === 'import'
                            ? 'bg-green-500'
                            : activity.type === 'export'
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                        )}
                      />
                      <div>
                        <p className='text-sm font-medium'>{activity.item}</p>
                        <p className='text-muted-foreground text-xs'>
                          {activity.type === 'import'
                            ? 'Nhập'
                            : activity.type === 'export'
                              ? 'Xuất'
                              : 'Kiểm tra'}
                          : {activity.quantity} kg - {activity.staff}
                        </p>
                      </div>
                    </div>
                    <span className='text-muted-foreground text-xs'>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Các chức năng thường dùng cho warehouse staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <Link
                href='/dashboard/warehouse/inventory'
                className='flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50'
              >
                <IconPackage className='mb-2 h-8 w-8 text-blue-600' />
                <span className='text-sm font-medium'>Quản lý tồn kho</span>
              </Link>
              <Link
                href='/dashboard/warehouse/stock'
                className='flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50'
              >
                <IconTruck className='mb-2 h-8 w-8 text-green-600' />
                <span className='text-sm font-medium'>Nhập/Xuất kho</span>
              </Link>
              <Link
                href='/dashboard/warehouse/barcode-scanner'
                className='flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50'
              >
                <IconBarcode className='mb-2 h-8 w-8 text-purple-600' />
                <span className='text-sm font-medium'>Quét mã vạch</span>
              </Link>
              <Link
                href='/dashboard/warehouse/iot-dashboard'
                className='flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50'
              >
                <IconTemperature className='mb-2 h-8 w-8 text-red-600' />
                <span className='text-sm font-medium'>Giám sát IoT</span>
              </Link>
              <Link
                href='/dashboard/warehouse/iot-devices'
                className='flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50'
              >
                <IconEye className='mb-2 h-8 w-8 text-blue-600' />
                <span className='text-sm font-medium'>Quản lý thiết bị</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
