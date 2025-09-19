'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconPackage,
  IconTemperature,
  IconDroplet,
  IconPlus,
  IconEye,
  IconBarcode,
  IconArrowLeft,
  IconSettings,
  IconRefresh
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface WarehouseDetailPageProps {
  warehouseId: string;
}

export default function WarehouseDetailPage({
  warehouseId
}: WarehouseDetailPageProps) {
  // Mock data for specific warehouse
  const warehouse = {
    id: warehouseId,
    name: `Kho ${warehouseId === 'WH001' ? 'Trung tâm Hà Nội' : warehouseId === 'WH002' ? 'Chi nhánh Hồ Chí Minh' : 'Kho số ' + warehouseId}`,
    location:
      warehouseId === 'WH001'
        ? 'Hà Nội'
        : warehouseId === 'WH002'
          ? 'TP.HCM'
          : 'Đà Nẵng',
    status: 'active' as const,
    manager: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'manager@warehouse.com',
    address: '123 Đường ABC, Quận XYZ',
    totalItems: 12,
    capacity: 78,
    todayImport: 10,
    todayExport: 5,
    lowStockItems: 12,
    expiringSoon: 8,
    outOfStock: 3,
    areas: [
      {
        id: 'A1',
        name: 'Khu vực A1 - Rau củ tươi',
        temperature: 4,
        humidity: 65,
        products: 3,
        capacity: 85,
        status: 'normal' as const,
        lastUpdated: '2 phút trước',
        sensors: [
          {
            id: 'T001',
            type: 'temperature',
            value: 4,
            unit: '°C',
            status: 'normal'
          },
          {
            id: 'H001',
            type: 'humidity',
            value: 65,
            unit: '%',
            status: 'normal'
          },
          {
            id: 'P001',
            type: 'pressure',
            value: 1013,
            unit: 'hPa',
            status: 'normal'
          }
        ]
      },
      {
        id: 'A2',
        name: 'Khu vực A2 - Trái cây',
        temperature: 6,
        humidity: 70,
        products: 3,
        capacity: 72,
        status: 'warning' as const,
        lastUpdated: '1 phút trước',
        sensors: [
          {
            id: 'T002',
            type: 'temperature',
            value: 6,
            unit: '°C',
            status: 'normal'
          },
          {
            id: 'H002',
            type: 'humidity',
            value: 70,
            unit: '%',
            status: 'warning'
          },
          {
            id: 'P002',
            type: 'pressure',
            value: 1015,
            unit: 'hPa',
            status: 'normal'
          }
        ]
      },
      {
        id: 'A3',
        name: 'Khu vực A3 - Thịt cá đông lạnh',
        temperature: -18,
        humidity: 45,
        products: 3,
        capacity: 90,
        status: 'normal' as const,
        lastUpdated: '30 giây trước',
        sensors: [
          {
            id: 'T003',
            type: 'temperature',
            value: -18,
            unit: '°C',
            status: 'normal'
          },
          {
            id: 'H003',
            type: 'humidity',
            value: 45,
            unit: '%',
            status: 'normal'
          },
          {
            id: 'P003',
            type: 'pressure',
            value: 1012,
            unit: 'hPa',
            status: 'normal'
          }
        ]
      },
      {
        id: 'A4',
        name: 'Khu vực A4 - Sản phẩm khô',
        temperature: 25,
        humidity: 40,
        products: 3,
        capacity: 65,
        status: 'normal' as const,
        lastUpdated: '5 phút trước',
        sensors: [
          {
            id: 'T004',
            type: 'temperature',
            value: 25,
            unit: '°C',
            status: 'normal'
          },
          {
            id: 'H004',
            type: 'humidity',
            value: 40,
            unit: '%',
            status: 'normal'
          },
          {
            id: 'P004',
            type: 'pressure',
            value: 1014,
            unit: 'hPa',
            status: 'normal'
          }
        ]
      }
    ],
    recentActivities: [
      {
        id: 1,
        type: 'import' as const,
        item: 'Cà rót Đà Lạt',
        quantity: 150,
        area: 'A1',
        staff: 'Trần Văn B',
        time: '10:30'
      },
      {
        id: 2,
        type: 'export' as const,
        item: 'Thịt bò úc',
        quantity: 80,
        area: 'A3',
        staff: 'Lê Thị C',
        time: '09:45'
      },
      {
        id: 3,
        type: 'check' as const,
        item: 'Kiểm tra nhiệt độ A2',
        quantity: 0,
        area: 'A2',
        staff: 'Phạm Văn D',
        time: '09:15'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'border-green-200 dark:border-green-500';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-500';
      case 'critical':
        return 'border-red-200 dark:border-red-500';
      default:
        return 'border-gray-200 dark:border-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // const getSensorStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'normal':
  //       return 'text-green-600';
  //     case 'warning':
  //       return 'text-yellow-600';
  //     case 'critical':
  //       return 'text-red-600';
  //     default:
  //       return 'text-gray-600';
  //   }
  // };

  return (
    <PageContainer scrollable>
      <div className='w-full max-w-none space-y-3 md:space-y-4'>
        {/* Header */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
          <div className='flex items-center space-x-2 md:space-x-3'>
            <Link
              href='/dashboard/warehouse'
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <IconArrowLeft className='mr-1 h-4 w-4 md:mr-2' />
              <span className='hidden sm:inline'>Quay lại</span>
            </Link>
            <div className='min-w-0 flex-1'>
              <h1 className='truncate text-lg font-bold sm:text-xl md:text-2xl'>
                {warehouse.name}
              </h1>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                ID: {warehouse.id} • {warehouse.location}
              </p>
            </div>
          </div>
          <div className='flex shrink-0 items-center space-x-1 md:space-x-2'>
            <Button variant='outline' size='sm'>
              <IconRefresh className='mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4' />
              <span className='hidden sm:inline'>Làm mới</span>
            </Button>
            <Button variant='outline' size='sm'>
              <IconSettings className='mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4' />
              <span className='hidden sm:inline'>Cài đặt</span>
            </Button>
          </div>
        </div>

        <Separator className='my-2 md:my-3' />

        {/* Warehouse Info */}
        <div className='grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4'>
          <Card className='xl:col-span-2'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg'>Thông tin kho</CardTitle>
              <CardDescription>Chi tiết thông tin và liên hệ</CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <p className='text-muted-foreground text-sm'>Quản lý kho</p>
                  <p className='font-medium'>{warehouse.manager}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Số điện thoại</p>
                  <p className='font-medium'>{warehouse.phone}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Email</p>
                  <p className='font-medium'>{warehouse.email}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Trạng thái</p>
                  <Badge
                    variant={
                      warehouse.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {warehouse.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
              </div>
              <div className='mt-3'>
                <p className='text-muted-foreground text-sm'>Địa chỉ</p>
                <p className='font-medium'>{warehouse.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg'>Thống kê tổng quan</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-0'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Tổng sản phẩm
                  </span>
                  <span className='font-semibold'>
                    {warehouse.totalItems.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Công suất
                  </span>
                  <span className='font-semibold'>{warehouse.capacity}%</span>
                </div>
                <Progress value={warehouse.capacity} className='h-2' />
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Nhập hôm nay
                  </span>
                  <span className='font-semibold text-green-600'>
                    +{warehouse.todayImport}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Xuất hôm nay
                  </span>
                  <span className='font-semibold text-blue-600'>
                    -{warehouse.todayExport}
                  </span>
                </div>
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Sắp hết hàng
                  </span>
                  <span className='font-semibold text-yellow-600'>
                    {warehouse.lowStockItems}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Sắp hết hạn
                  </span>
                  <span className='font-semibold text-red-600'>
                    {warehouse.expiringSoon}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Hết hàng
                  </span>
                  <span className='font-semibold text-red-600'>
                    {warehouse.outOfStock}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas */}
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <h3 className='text-lg font-semibold'>
              Khu vực trong kho ({warehouse.areas.length})
            </h3>
            <Button variant='outline' size='sm'>
              <IconPlus className='mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4' />
              <span className='hidden sm:inline'>Thêm khu vực</span>
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {warehouse.areas.map((area) => (
              <Card
                key={area.id}
                className={cn('border-2', getStatusColor(area.status))}
              >
                <CardHeader>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1 pr-1'>
                      <CardTitle className='truncate text-sm'>
                        {area.name}
                      </CardTitle>
                      <CardDescription className='mt-0.5 truncate text-xs'>
                        ID: {area.id} • {area.lastUpdated}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2 px-3 pt-0 pb-3'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'max-w-fit shrink-0 px-1 py-0.5 text-xs',
                      getStatusBadgeColor(area.status)
                    )}
                  >
                    <span className='truncate'>
                      {area.status === 'normal'
                        ? 'Bình thường'
                        : area.status === 'warning'
                          ? 'Cảnh báo'
                          : 'Nguy hiểm'}
                    </span>
                  </Badge>
                  {/* Environmental Stats */}
                  <div className='grid grid-cols-3 gap-1 text-center'>
                    <div className='min-w-0 space-y-0.5'>
                      <div className='flex flex-wrap items-center justify-center'>
                        <IconTemperature className='mr-0.5 h-3 w-3 shrink-0 text-blue-500' />
                        <span className='text-muted-foreground truncate text-xs'>
                          Nhiệt độ
                        </span>
                      </div>
                      <p className='truncate text-xs font-bold text-blue-600'>
                        {area.temperature}°C
                      </p>
                    </div>
                    <div className='ml-3 min-w-0 space-y-0.5'>
                      <div className='flex flex-wrap items-center justify-center'>
                        <IconDroplet className='mr-0.5 h-3 w-3 shrink-0 text-cyan-500' />
                        <span className='text-muted-foreground truncate text-xs'>
                          Độ ẩm
                        </span>
                      </div>
                      <p className='truncate text-xs font-bold text-cyan-600'>
                        {area.humidity}%
                      </p>
                    </div>
                    <div className='min-w-0 space-y-0.5'>
                      <div className='flex flex-wrap items-center justify-center'>
                        <IconPackage className='mr-0.5 h-3 w-3 shrink-0 text-green-500' />
                        <span className='text-muted-foreground truncate text-xs'>
                          SP
                        </span>
                      </div>
                      <p className='truncate text-xs font-bold text-green-600'>
                        {area.products}
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className='space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-xs'>
                        Công suất khu vực
                      </span>
                      <span className='text-xs font-semibold'>
                        {area.capacity}%
                      </span>
                    </div>
                    <Progress value={area.capacity} className='h-1' />
                  </div>

                  {/* Sensors */}
                  <div className='space-y-1'>
                    <p className='text-xs font-medium'>
                      Cảm biến ({area.sensors.length}):
                    </p>
                    <div className='space-y-0.5'>
                      {area.sensors.map((sensor) => (
                        <div
                          key={sensor.id}
                          className='flex min-w-0 items-center justify-between gap-1 rounded bg-gray-50 p-1 text-xs dark:bg-gray-800'
                        >
                          <span className='min-w-0 flex-1 truncate text-xs font-medium'>
                            {sensor.id}
                          </span>
                          <div className='flex shrink-0 items-center space-x-1'>
                            <span className='text-xs whitespace-nowrap'>
                              {sensor.value}
                              {sensor.unit}
                            </span>
                            <div
                              className={cn(
                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                sensor.status === 'normal'
                                  ? 'bg-green-500 dark:bg-green-600'
                                  : sensor.status === 'warning'
                                    ? 'bg-yellow-500 dark:bg-yellow-600'
                                    : 'bg-red-500 dark:bg-red-600'
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-1'>
                    <Link
                      href={`/dashboard/warehouse/${warehouse.id}/area/${area.id}`}
                      className={cn(
                        buttonVariants({ variant: 'default', size: 'sm' }),
                        'h-7 min-w-0 flex-1 text-xs'
                      )}
                    >
                      <IconEye className='mr-1 h-3 w-3 shrink-0' />
                      <span className='truncate'>Chi tiết</span>
                    </Link>
                    <Link
                      href={`/dashboard/warehouse/${warehouse.id}/area/${area.id}/inventory`}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'h-7 min-w-0 flex-1 text-xs'
                      )}
                    >
                      <IconBarcode className='mr-1 h-3 w-3 shrink-0' />
                      <span className='truncate'>Quản lý</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các giao dịch mới nhất trong kho này
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-2'>
              {warehouse.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between rounded border p-2'
                >
                  <div className='flex min-w-0 flex-1 items-center space-x-2'>
                    <div
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        activity.type === 'import'
                          ? 'bg-green-500'
                          : activity.type === 'export'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                      )}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {activity.item}
                      </p>
                      <p className='text-muted-foreground truncate text-xs'>
                        {activity.type === 'import'
                          ? 'Nhập'
                          : activity.type === 'export'
                            ? 'Xuất'
                            : 'Kiểm tra'}
                        {activity.quantity > 0 && `: ${activity.quantity} kg`} •
                        Khu vực {activity.area} • {activity.staff}
                      </p>
                    </div>
                  </div>
                  <span className='text-muted-foreground ml-2 shrink-0 text-xs'>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
