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
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { fetchManagers, updateManager } from '@/services/manager.service';
import { createWarehouse, fetchWarehouses } from '@/services/warehouse.service';
import type { Manager } from '@/types/manager';
import {
  IconAlertTriangle,
  IconBarcode,
  IconClockHour4,
  IconDroplet,
  IconEye,
  IconPackage,
  IconPlus,
  IconTemperature,
  IconTrendingUp
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface WarehouseOverviewPageProps {}

export function WarehouseOverviewPage({}: WarehouseOverviewPageProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [apiWarehouses, setApiWarehouses] = useState<
    { id: string; name: string; address: string }[]
  >([]);
  const [managersWithoutWarehouse, setManagersWithoutWarehouse] = useState<
    Manager[]
  >([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    address: ''
  });
  // Mock data cho kho trung tâm Hà Nội - giữ làm mẫu design
  const mockWarehouses = [
    {
      id: 'WH001',
      name: 'Kho Trung tâm Hà Nội',
      location: 'Hà Nội',
      capacity: 85,
      totalItems: 10,
      lowStockItems: 23,
      expiringSoon: 8,
      outOfStock: 5,
      todayImport: 10,
      todayExport: 15,
      status: 'active',
      areas: [
        {
          id: 'A1',
          name: 'Khu vực A1 - Rau củ',
          temperature: 4.2,
          humidity: 65,
          capacity: 90,
          products: 3
        },
        {
          id: 'A2',
          name: 'Khu vực A2 - Trái cây',
          temperature: 7.2,
          humidity: 70,
          capacity: 75,
          products: 2
        },
        {
          id: 'A3',
          name: 'Khu vực A3 - Ngũ cốc',
          temperature: 18.5,
          humidity: 45,
          capacity: 95,
          products: 5
        }
      ]
    }
  ];

  // Ghép tên / id kho từ API vào mock kho trung tâm, đồng thời thêm các kho API còn lại
  const mergedWarehouses = useMemo(() => {
    if (apiWarehouses.length === 0) return mockWarehouses;

    const [firstApi, ...restApis] = apiWarehouses;

    const centralWarehouse = {
      ...mockWarehouses[0],
      id: firstApi?.id ?? mockWarehouses[0].id,
      name: firstApi?.name || mockWarehouses[0].name
    };

    const apiOnlyWarehouses = restApis.map((w) => ({
      id: w.id,
      name: w.name,
      location: w.address,
      capacity: 70,
      totalItems: 5,
      lowStockItems: 0,
      expiringSoon: 0,
      outOfStock: 0,
      todayImport: 0,
      todayExport: 0,
      status: 'active',
      areas: []
    }));

    return [centralWarehouse, ...apiOnlyWarehouses];
  }, [apiWarehouses]);

  const totalStats = useMemo(() => {
    const list = mergedWarehouses;
    if (list.length === 0) {
      return {
        totalWarehouses: 0,
        totalItems: 0,
        totalLowStock: 0,
        totalExpiring: 0,
        totalOutOfStock: 0,
        avgCapacity: 0
      };
    }

    return {
      totalWarehouses: list.length,
      totalItems: list.reduce((sum, wh) => sum + wh.totalItems, 0),
      totalLowStock: list.reduce((sum, wh) => sum + wh.lowStockItems, 0),
      totalExpiring: list.reduce((sum, wh) => sum + wh.expiringSoon, 0),
      totalOutOfStock: list.reduce((sum, wh) => sum + wh.outOfStock, 0),
      avgCapacity: Math.round(
        list.reduce((sum, wh) => sum + wh.capacity, 0) / list.length
      )
    };
  }, [mergedWarehouses]);

  useEffect(() => {
    const loadWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const res = await fetchWarehouses({ page: 1, limit: 10 });
        setApiWarehouses(
          (res.data || []).map((w) => ({
            id: w.id,
            name: w.name,
            address: w.address
          }))
        );
      } catch (error) {
        // Chỉ log nhẹ, vẫn dùng mock nếu API lỗi
        console.error(
          'Unable to load warehouses, fallback to mock data',
          error
        );
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    void loadWarehouses();
  }, []);

  // Fetch managers chưa gắn warehouse
  const loadManagersWithoutWarehouse = async () => {
    setIsLoadingManagers(true);
    try {
      const res = await fetchManagers({ page: 1, limit: 100 });
      setManagersWithoutWarehouse(
        (res.data || []).filter((m) => !m.warehouse || !m.warehouse.id)
      );
    } catch (error) {
      console.error('Unable to load managers', error);
      setManagersWithoutWarehouse([]);
    } finally {
      setIsLoadingManagers(false);
    }
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

  const resetForms = () => {
    setWarehouseForm({ name: '', address: '' });
    setSelectedManagerId('');
  };

  const handleCreateWarehouseWithManager = async () => {
    if (!warehouseForm.name || !warehouseForm.address) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin kho',
        description: 'Vui lòng nhập tên kho và địa chỉ.'
      });
      return;
    }

    if (!selectedManagerId) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin manager',
        description: 'Vui lòng chọn một manager chưa có kho.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Tạo warehouse mới
      const newWarehouse = await createWarehouse({
        name: warehouseForm.name,
        address: warehouseForm.address
      });

      // 2. Gán manager hiện có vào warehouse này
      await updateManager(selectedManagerId, {
        warehouse: { id: newWarehouse.id }
      });

      toast({
        title: 'Đã tạo kho mới',
        description: `Kho ${newWarehouse.name} đã được tạo và gán cho manager đã chọn.`
      });

      // Cập nhật danh sách warehouses từ API để tên kho hiển thị đúng
      try {
        const res = await fetchWarehouses({ page: 1, limit: 10 });
        setApiWarehouses(
          (res.data || []).map((w) => ({
            id: w.id,
            name: w.name,
            address: w.address
          }))
        );
      } catch {
        // bỏ qua lỗi, đã hiển thị toast thành công phía trên
      }

      resetForms();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo kho mới',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <Heading
            title='Tổng quan kho hàng'
            description='Giám sát và quản lý toàn bộ hoạt động kho nông sản'
          />
        </div>
        <Separator />

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
            <h3 className='text-lg font-semibold'>
              Danh sách kho{' '}
              {isLoadingWarehouses && (
                <span className='text-muted-foreground text-xs'>
                  (đang tải...)
                </span>
              )}
            </h3>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setIsCreateDialogOpen(true);
                void loadManagersWithoutWarehouse();
              }}
            >
              <IconPlus className='mr-2 h-4 w-4' />
              Thêm kho mới
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
            {mergedWarehouses.map((warehouse) => (
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
                        {warehouse.location}
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
                      <p className='text-sm font-medium text-orange-700 dark:text-orange-500'>
                        Cảnh báo:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {warehouse.lowStockItems > 0 && (
                          <Badge
                            variant='outline'
                            className='border-yellow-300 text-yellow-700 dark:border-yellow-500 dark:text-yellow-500'
                          >
                            {warehouse.lowStockItems} sắp hết
                          </Badge>
                        )}
                        {warehouse.expiringSoon > 0 && (
                          <Badge
                            variant='outline'
                            className='border-red-300 text-red-700 dark:border-red-500 dark:text-red-500'
                          >
                            {warehouse.expiringSoon} hết hạn
                          </Badge>
                        )}
                        {warehouse.outOfStock > 0 && (
                          <Badge
                            variant='destructive'
                            className='dark:bg-red-500 dark:text-white'
                          >
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
                          className='flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-300'
                        >
                          <div className='flex-1'>
                            <p className='text-sm font-medium dark:text-black'>
                              {area.name}
                            </p>
                            <div className='text-muted-foreground flex items-center space-x-4 text-xs'>
                              <span className='flex items-center dark:text-black'>
                                <IconTemperature className='mr-1 h-3 w-3' />
                                {area.temperature}°C
                              </span>
                              <span className='flex items-center dark:text-black'>
                                <IconDroplet className='mr-1 h-3 w-3' />
                                {area.humidity}%
                              </span>
                              <span className='dark:text-black'>
                                {area.products} sản phẩm
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='flex items-center space-x-1'>
                              <Progress
                                value={area.capacity}
                                className='h-2 w-12'
                              />
                              <span className='text-xs font-medium dark:text-black'>
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

      {/* Dialog tạo kho + manager */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForms();
        }}
      >
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Thêm kho mới & Manager</DialogTitle>
          </DialogHeader>
          <div className='space-y-6 py-2'>
            <div className='space-y-3'>
              <p className='text-sm font-semibold'>Thông tin kho</p>
              <div className='space-y-2'>
                <Label htmlFor='warehouse-name'>Tên kho *</Label>
                <Input
                  id='warehouse-name'
                  placeholder='Ví dụ: Kho Trung tâm Hà Nội'
                  value={warehouseForm.name}
                  onChange={(e) =>
                    setWarehouseForm((prev) => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='warehouse-address'>Địa chỉ *</Label>
                <Input
                  id='warehouse-address'
                  placeholder='Nhập địa chỉ kho'
                  value={warehouseForm.address}
                  onChange={(e) =>
                    setWarehouseForm((prev) => ({
                      ...prev,
                      address: e.target.value
                    }))
                  }
                />
              </div>
            </div>

            <div className='space-y-3'>
              <p className='text-sm font-semibold'>
                Chọn Manager (chưa có kho)
              </p>
              <div className='space-y-2'>
                <Label htmlFor='manager-select'>Manager *</Label>
                <Select
                  value={selectedManagerId}
                  onValueChange={(value) => setSelectedManagerId(value)}
                  disabled={
                    isLoadingManagers || managersWithoutWarehouse.length === 0
                  }
                >
                  <SelectTrigger id='manager-select'>
                    <SelectValue
                      placeholder={
                        isLoadingManagers
                          ? 'Đang tải danh sách manager...'
                          : managersWithoutWarehouse.length === 0
                            ? 'Không còn manager trống'
                            : 'Chọn manager'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {managersWithoutWarehouse.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.user?.email ?? m.id} -{' '}
                        {[m.user?.firstName, m.user?.lastName]
                          .filter(Boolean)
                          .join(' ') || 'Chưa có tên'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateWarehouseWithManager}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo kho & manager'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
