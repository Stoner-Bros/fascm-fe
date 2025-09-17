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
  IconTrendingUp
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface WarehouseOverviewPageProps {}

export function WarehouseOverviewPage({}: WarehouseOverviewPageProps) {
  // Mock data cho nhiều kho - trong thực tế sẽ fetch từ API
  const warehouses = [
    {
      id: 'WH001',
      name: 'Kho Trung tâm Hà Nội',
      location: 'Hà Nội',
      capacity: 85,
      totalItems: 1247,
      lowStockItems: 23,
      expiringSoon: 8,
      outOfStock: 5,
      todayImport: 45,
      todayExport: 32,
      status: 'active',
      areas: [
        {
          id: 'A1',
          name: 'Khu vực A1 - Rau củ',
          temperature: 4.2,
          humidity: 65,
          capacity: 90,
          products: 320
        },
        {
          id: 'A2',
          name: 'Khu vực A2 - Trái cây',
          temperature: 7.2,
          humidity: 70,
          capacity: 75,
          products: 280
        },
        {
          id: 'A3',
          name: 'Khu vực A3 - Ngũ cốc',
          temperature: 18.5,
          humidity: 45,
          capacity: 95,
          products: 647
        }
      ]
    },
    {
      id: 'WH002',
      name: 'Kho Miền Nam TP.HCM',
      location: 'TP. Hồ Chí Minh',
      capacity: 78,
      totalItems: 892,
      lowStockItems: 15,
      expiringSoon: 3,
      outOfStock: 2,
      todayImport: 28,
      todayExport: 41,
      status: 'active',
      areas: [
        {
          id: 'B1',
          name: 'Khu vực B1 - Rau củ',
          temperature: 5.1,
          humidity: 68,
          capacity: 85,
          products: 245
        },
        {
          id: 'B2',
          name: 'Khu vực B2 - Trái cây nhiệt đới',
          temperature: 8.0,
          humidity: 75,
          capacity: 80,
          products: 367
        },
        {
          id: 'B3',
          name: 'Khu vực B3 - Gia vị',
          temperature: 20.0,
          humidity: 40,
          capacity: 70,
          products: 280
        }
      ]
    },
    {
      id: 'WH003',
      name: 'Kho Miền Trung Đà Nẵng',
      location: 'Đà Nẵng',
      capacity: 92,
      totalItems: 1456,
      lowStockItems: 31,
      expiringSoon: 12,
      outOfStock: 7,
      todayImport: 52,
      todayExport: 38,
      status: 'active',
      areas: [
        {
          id: 'C1',
          name: 'Khu vực C1 - Hải sản khô',
          temperature: 15.0,
          humidity: 35,
          capacity: 88,
          products: 412
        },
        {
          id: 'C2',
          name: 'Khu vực C2 - Rau củ',
          temperature: 4.8,
          humidity: 62,
          capacity: 95,
          products: 523
        },
        {
          id: 'C3',
          name: 'Khu vực C3 - Trái cây',
          temperature: 6.5,
          humidity: 72,
          capacity: 93,
          products: 521
        }
      ]
    }
  ];

  const totalStats = {
    totalWarehouses: warehouses.length,
    totalItems: warehouses.reduce((sum, wh) => sum + wh.totalItems, 0),
    totalLowStock: warehouses.reduce((sum, wh) => sum + wh.lowStockItems, 0),
    totalExpiring: warehouses.reduce((sum, wh) => sum + wh.expiringSoon, 0),
    totalOutOfStock: warehouses.reduce((sum, wh) => sum + wh.outOfStock, 0),
    avgCapacity: Math.round(
      warehouses.reduce((sum, wh) => sum + wh.capacity, 0) / warehouses.length
    )
  };

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

        {/* Tổng quan hệ thống */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Tổng số kho</CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalStats.totalWarehouses}
              </div>
              <p className='text-muted-foreground text-xs'>
                Kho đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng sản phẩm
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalStats.totalItems.toLocaleString()}
              </div>
              <p className='text-muted-foreground text-xs'>
                <IconTrendingUp className='mr-1 inline h-3 w-3' />
                Trên tất cả các kho
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
                {totalStats.totalLowStock}
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
                {totalStats.totalExpiring}
              </div>
              <p className='text-muted-foreground text-xs'>Trong 2 ngày tới</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Công suất TB
              </CardTitle>
              <IconTrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalStats.avgCapacity}%
              </div>
              <p className='text-muted-foreground text-xs'>
                Trung bình các kho
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách kho */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Danh sách kho</h3>
            <Button variant='outline' size='sm'>
              <IconPlus className='mr-2 h-4 w-4' />
              Thêm kho mới
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
            {warehouses.map((warehouse) => (
              <Card
                key={warehouse.id}
                className='transition-shadow hover:shadow-lg'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>
                        {warehouse.name}
                      </CardTitle>
                      <CardDescription className='mt-1 flex items-center'>
                        <IconPackage className='mr-1 h-4 w-4' />
                        {warehouse.location} • ID: {warehouse.id}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        warehouse.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {warehouse.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Thống kê kho */}
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground'>Tổng sản phẩm</p>
                      <p className='font-semibold'>
                        {warehouse.totalItems.toLocaleString()}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground'>Công suất</p>
                      <div className='flex items-center space-x-2'>
                        <Progress
                          value={warehouse.capacity}
                          className='flex-1'
                        />
                        <span className='font-semibold'>
                          {warehouse.capacity}%
                        </span>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground'>Nhập hôm nay</p>
                      <p className='font-semibold text-green-600'>
                        +{warehouse.todayImport}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground'>Xuất hôm nay</p>
                      <p className='font-semibold text-blue-600'>
                        -{warehouse.todayExport}
                      </p>
                    </div>
                  </div>

                  {/* Cảnh báo */}
                  {(warehouse.lowStockItems > 0 ||
                    warehouse.expiringSoon > 0 ||
                    warehouse.outOfStock > 0) && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-orange-700'>
                        Cảnh báo:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {warehouse.lowStockItems > 0 && (
                          <Badge
                            variant='outline'
                            className='border-yellow-300 text-yellow-700'
                          >
                            {warehouse.lowStockItems} sắp hết
                          </Badge>
                        )}
                        {warehouse.expiringSoon > 0 && (
                          <Badge
                            variant='outline'
                            className='border-red-300 text-red-700'
                          >
                            {warehouse.expiringSoon} hết hạn
                          </Badge>
                        )}
                        {warehouse.outOfStock > 0 && (
                          <Badge variant='destructive'>
                            {warehouse.outOfStock} hết hàng
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Khu vực trong kho */}
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>
                      Khu vực ({warehouse.areas.length}):
                    </p>
                    <div className='space-y-2'>
                      {warehouse.areas.map((area) => (
                        <div
                          key={area.id}
                          className='flex items-center justify-between rounded bg-gray-50 p-2'
                        >
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>{area.name}</p>
                            <div className='text-muted-foreground flex items-center space-x-4 text-xs'>
                              <span className='flex items-center'>
                                <IconTemperature className='mr-1 h-3 w-3' />
                                {area.temperature}°C
                              </span>
                              <span className='flex items-center'>
                                <IconDroplet className='mr-1 h-3 w-3' />
                                {area.humidity}%
                              </span>
                              <span>{area.products} sản phẩm</span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='flex items-center space-x-1'>
                              <Progress
                                value={area.capacity}
                                className='h-2 w-12'
                              />
                              <span className='text-xs font-medium'>
                                {area.capacity}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <Link
                      href={`/dashboard/warehouse/${warehouse.id}`}
                      className={cn(
                        buttonVariants({ variant: 'default', size: 'sm' }),
                        'flex-1'
                      )}
                    >
                      <IconEye className='mr-2 h-4 w-4' />
                      Xem chi tiết
                    </Link>
                    <Link
                      href={`/dashboard/warehouse/${warehouse.id}/inventory`}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'flex-1'
                      )}
                    >
                      <IconBarcode className='mr-2 h-4 w-4' />
                      Quản lý
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
