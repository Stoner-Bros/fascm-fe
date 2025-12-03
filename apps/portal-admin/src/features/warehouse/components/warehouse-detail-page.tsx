'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { createArea, fetchAreas } from '@/services/area.service';
import { fetchManagers } from '@/services/manager.service';
import { fetchWarehouseById } from '@/services/warehouse.service';
import type { Area } from '@/types/area';
import type { Manager } from '@/types/manager';
import type { Warehouse } from '@/types/warehouse';
import {
  IconArrowLeft,
  IconBarcode,
  IconDroplet,
  IconEye,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconTemperature
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface WarehouseDetailPageProps {
  warehouseId: string;
}

export default function WarehouseDetailPage({
  warehouseId
}: WarehouseDetailPageProps) {
  const { toast } = useToast();

  // Mock data cho phần thống kê & hoạt động (sẽ thay dần bằng API sau)
  const warehouseMock = {
    id: warehouseId,
    name: 'Kho Trung tâm Hà Nội',
    location: 'Hà Nội',
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

  const [apiWarehouse, setApiWarehouse] = useState<Warehouse | null>(null);
  const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(false);
  const [warehouseManager, setWarehouseManager] = useState<Manager | null>(
    null
  );
  const [apiAreas, setApiAreas] = useState<Area[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  const [isCreateAreaDialogOpen, setIsCreateAreaDialogOpen] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [areaForm, setAreaForm] = useState({
    name: '',
    description: '',
    capacity: 0,
    location: '',
    iotDeviceId: ''
  });

  const warehouse = useMemo(() => {
    return {
      ...warehouseMock,
      id: apiWarehouse?.id ?? warehouseMock.id,
      name: apiWarehouse?.name ?? warehouseMock.name,
      address: apiWarehouse?.address ?? warehouseMock.address
    };
  }, [apiWarehouse, warehouseMock]);

  const loadWarehouse = async () => {
    setIsLoadingWarehouse(true);
    try {
      const data = await fetchWarehouseById(warehouseId);
      setApiWarehouse(data);
    } catch (error) {
      console.error('Unable to load warehouse', error);
      toast({
        variant: 'destructive',
        title: 'Không thể tải thông tin kho',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoadingWarehouse(false);
    }
  };

  const loadWarehouseManager = async () => {
    try {
      const res = await fetchManagers({ page: 1, limit: 100, warehouseId });
      // Phòng khi backend không filter đúng theo warehouseId, vẫn lọc lại ở FE
      const managers = (res.data || []).filter(
        (m) => m.warehouse?.id === warehouseId
      );
      setWarehouseManager(managers[0] ?? null);
    } catch (error) {
      console.error('Unable to load warehouse manager', error);
      setWarehouseManager(null);
    }
  };

  const loadAreas = async () => {
    setIsLoadingAreas(true);
    try {
      const res = await fetchAreas({ page: 1, limit: 50, warehouseId });
      setApiAreas(res.data || []);
    } catch (error) {
      console.error('Unable to load areas', error);
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách khu vực',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoadingAreas(false);
    }
  };

  useEffect(() => {
    void loadWarehouse();
    void loadAreas();
    void loadWarehouseManager();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  const resetAreaForm = () => {
    setAreaForm({
      name: '',
      description: '',
      capacity: 0,
      location: '',
      iotDeviceId: ''
    });
  };

  const handleCreateArea = async () => {
    if (!areaForm.name || !areaForm.location || !areaForm.capacity) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin khu vực',
        description: 'Vui lòng nhập tên, vị trí và sức chứa khu vực.'
      });
      return;
    }

    try {
      setIsCreatingArea(true);
      const capacityValue = Number(areaForm.capacity);
      await createArea({
        name: areaForm.name,
        description: areaForm.description || undefined,
        capacity: capacityValue,
        availableCapacity: capacityValue, // Khi tạo mới, availableCapacity = capacity
        location: areaForm.location,
        warehouse: { id: warehouseId },
        ...(areaForm.iotDeviceId
          ? { iotDevice: [{ id: areaForm.iotDeviceId }] }
          : {})
      });

      toast({
        title: 'Đã tạo khu vực',
        description: `Khu vực ${areaForm.name} đã được tạo trong kho này.`
      });

      resetAreaForm();
      setIsCreateAreaDialogOpen(false);
      await loadAreas();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo khu vực',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsCreatingArea(false);
    }
  };

  // Map areas từ API sang layout card
  // Chỉ lấy các khu vực thuộc đúng warehouse hiện tại
  const apiAreaCards = useMemo(() => {
    return apiAreas
      .filter((a) => a.warehouse?.id === warehouseId)
      .map((a) => ({
        id: a.id,
        name: a.name,
        temperature: 0,
        description: a.description,
        humidity: 0,
        products: 0,
        capacity: a.capacity ?? 0,
        status: 'normal' as const,
        lastUpdated: '—',
        sensors: []
      }));
  }, [apiAreas, warehouseId]);

  const allAreas = useMemo(() => apiAreaCards, [apiAreaCards]);

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
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                void loadWarehouse();
                void loadAreas();
              }}
              disabled={isLoadingWarehouse || isLoadingAreas}
            >
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
                  <p className='font-medium'>
                    {warehouseManager
                      ? `${warehouseManager.user?.firstName ?? ''} ${warehouseManager.user?.lastName ?? ''}`.trim() ||
                        warehouseManager.user?.email ||
                        warehouseManager.id
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Số điện thoại</p>
                  <p className='font-medium'>
                    {warehouseManager?.user?.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Email</p>
                  <p className='font-medium'>
                    {warehouseManager?.user?.email || '—'}
                  </p>
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
                <p className='font-medium'>
                  {apiWarehouse?.address || warehouse.address}
                </p>
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
              Khu vực trong kho ({allAreas.length})
            </h3>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsCreateAreaDialogOpen(true)}
            >
              <IconPlus className='mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4' />
              <span className='hidden sm:inline'>Thêm khu vực</span>
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {allAreas.map((area) => (
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
                        {area.description || 'Không có mô tả'}
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
                  {/* <div className='space-y-1'>
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
                  </div> */}

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

      {/* Dialog tạo khu vực mới */}
      <Dialog
        open={isCreateAreaDialogOpen}
        onOpenChange={(open) => {
          setIsCreateAreaDialogOpen(open);
          if (!open) resetAreaForm();
        }}
      >
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Thêm khu vực mới</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='area-name'>Tên khu vực *</Label>
              <Input
                id='area-name'
                placeholder='Ví dụ: Khu vực A2 - Trái cây'
                value={areaForm.name}
                onChange={(e) =>
                  setAreaForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='area-description'>Mô tả</Label>
              <Input
                id='area-description'
                placeholder='Mô tả ngắn về khu vực'
                value={areaForm.description}
                onChange={(e) =>
                  setAreaForm((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
              />
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='area-capacity'>Sức chứa (kg) *</Label>
                <Input
                  id='area-capacity'
                  type='number'
                  min={0}
                  placeholder='Ví dụ: 500'
                  value={areaForm.capacity}
                  onChange={(e) =>
                    setAreaForm((prev) => ({
                      ...prev,
                      capacity: Number(e.target.value)
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='area-location'>Vị trí *</Label>
                <Input
                  id='area-location'
                  placeholder='Ví dụ: Tầng 1 - Dãy A'
                  value={areaForm.location}
                  onChange={(e) =>
                    setAreaForm((prev) => ({
                      ...prev,
                      location: e.target.value
                    }))
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='iot-device-id'>IoT Device ID (tùy chọn)</Label>
              <Input
                id='iot-device-id'
                placeholder='Nhập ID cảm biến nếu có'
                value={areaForm.iotDeviceId}
                onChange={(e) =>
                  setAreaForm((prev) => ({
                    ...prev,
                    iotDeviceId: e.target.value
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateAreaDialogOpen(false)}
              disabled={isCreatingArea}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateArea} disabled={isCreatingArea}>
              {isCreatingArea ? 'Đang tạo...' : 'Tạo khu vực'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
