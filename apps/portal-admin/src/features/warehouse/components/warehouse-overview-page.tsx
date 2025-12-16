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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { fetchAreas } from '@/services/area.service';
import { fetchBatches } from '@/services/batch.service';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';
import { fetchManagers, updateManager } from '@/services/manager.service';
import { createWarehouse, fetchWarehouses } from '@/services/warehouse.service';
import type { Area } from '@/types/area';
import type { Batch } from '@/types/batch';
import type { Manager } from '@/types/manager';
import {
  IconDroplet,
  IconEye,
  IconPackage,
  IconTemperature
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
  const [warehouseAreas, setWarehouseAreas] = useState<Record<string, Area[]>>(
    {}
  );
  const [warehouseBatches, setWarehouseBatches] = useState<
    Record<string, Batch[]>
  >({});
  const [areaEnv, setAreaEnv] = useState<
    Record<string, { temperature?: number | null; humidity?: number | null }>
  >({});
  const [managersWithoutWarehouse, setManagersWithoutWarehouse] = useState<
    Manager[]
  >([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    address: ''
  });
  const toNumeric = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const parseDeviceData = (device: any) => {
    try {
      const raw = device?.data;
      if (typeof raw === 'string' && raw.trim().length > 0) {
        const obj = JSON.parse(raw);
        return {
          temperature: obj.temperature ?? obj.temp ?? obj.t ?? null,
          humidity: obj.humidity ?? obj.humid ?? obj.h ?? null
        };
      }
      if (Array.isArray(raw) && raw.length > 0) {
        const last = raw[raw.length - 1];
        return {
          temperature: last?.temperature ?? last?.temp ?? last?.t ?? null,
          humidity: last?.humidity ?? last?.humid ?? last?.h ?? null
        };
      }
      if (raw && typeof raw === 'object') {
        return {
          temperature:
            raw.temperature ?? raw.temp ?? raw.t ?? (raw as any).Temperature,
          humidity: raw.humidity ?? raw.humid ?? raw.h ?? (raw as any).Humidity
        };
      }
    } catch {
      // ignore parse errors
    }
    return { temperature: null, humidity: null };
  };

  // Tính toán warehouses từ API với areas và batches
  const mergedWarehouses = useMemo(() => {
    return apiWarehouses.map((w) => {
      const areas = warehouseAreas[w.id] || [];
      const batches = warehouseBatches[w.id] || [];

      // Tính tổng capacity = tổng capacity của các area
      const totalCapacity = areas.reduce(
        (sum, a) => sum + (a.capacity ?? 0),
        0
      );

      // Tính used capacity = tổng (capacity - availableCapacity) của các area
      const usedCapacity = areas.reduce((sum, a) => {
        const capacity = a.capacity ?? 0;
        const availableCapacity = a.availableCapacity ?? capacity;
        return sum + Math.max(0, capacity - availableCapacity);
      }, 0);

      // Tính capacity percentage
      const capacityPercentage =
        totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

      // Tính số sản phẩm unique trong các area
      const productSet = new Set<string>();
      batches.forEach((b) => {
        if (b.product?.id) {
          productSet.add(b.product.id);
        }
      });

      // Map areas với nhiệt độ, độ ẩm, số sản phẩm
      const areasWithData = areas.map((area) => {
        const env = areaEnv[area.id] ?? { temperature: null, humidity: null };
        const areaBatches = batches.filter((b) => b.area?.id === area.id);
        const areaProductSet = new Set<string>();
        areaBatches.forEach((b) => {
          if (b.product?.id) {
            areaProductSet.add(b.product.id);
          }
        });

        const areaCapacity = area.capacity ?? 0;
        const areaAvailableCapacity = area.availableCapacity ?? areaCapacity;
        const areaUsedCapacity = Math.max(
          0,
          areaCapacity - areaAvailableCapacity
        );
        const areaCapacityPercentage =
          areaCapacity > 0 ? (areaUsedCapacity / areaCapacity) * 100 : 0;

        return {
          id: area.id,
          name: area.name,
          temperature: env.temperature ?? null,
          humidity: env.humidity ?? null,
          capacity: areaCapacityPercentage,
          products: areaProductSet.size
        };
      });

      return {
        id: w.id,
        name: w.name,
        location: w.address,
        capacity: capacityPercentage,
        totalCapacity,
        usedCapacity,
        totalItems: productSet.size,
        lowStockItems: 0,
        expiringSoon: 0,
        outOfStock: 0,
        todayImport: 0,
        todayExport: 0,
        status: 'active' as const,
        areas: areasWithData
      };
    });
  }, [apiWarehouses, warehouseAreas, warehouseBatches, areaEnv]);

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

    const totalCapacity = list.reduce((sum, wh) => sum + wh.totalCapacity, 0);
    const totalUsedCapacity = list.reduce(
      (sum, wh) => sum + wh.usedCapacity,
      0
    );
    const avgCapacityPercentage =
      totalCapacity > 0 ? (totalUsedCapacity / totalCapacity) * 100 : 0;

    return {
      totalWarehouses: list.length,
      totalItems: list.reduce((sum, wh) => sum + wh.totalItems, 0),
      totalLowStock: list.reduce((sum, wh) => sum + wh.lowStockItems, 0),
      totalExpiring: list.reduce((sum, wh) => sum + wh.expiringSoon, 0),
      totalOutOfStock: list.reduce((sum, wh) => sum + wh.outOfStock, 0),
      avgCapacity: Math.round(avgCapacityPercentage)
    };
  }, [mergedWarehouses]);

  useEffect(() => {
    const loadWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const res = await fetchWarehouses({ page: 1, limit: 10 });
        const warehouses = (res.data || []).map((w) => ({
          id: w.id,
          name: w.name,
          address: w.address
        }));
        setApiWarehouses(warehouses);

        // Fetch tất cả areas một lần (không filter theo warehouseId)
        const allAreasRes = await fetchAreas({
          page: 1,
          limit: 200 // Fetch nhiều areas để cover tất cả warehouses
        });
        const allAreas = allAreasRes.data || [];

        // Fetch tất cả batches một lần (không filter theo areaId)
        const allBatchesRes = await fetchBatches({
          page: 1,
          limit: 500 // Fetch nhiều batches để cover tất cả areas
        });
        const allBatches = allBatchesRes.data || [];

        // Group areas theo warehouseId
        const areasMap: Record<string, Area[]> = {};
        const envMap: Record<
          string,
          { temperature?: number | null; humidity?: number | null }
        > = {};

        for (const area of allAreas) {
          const warehouseId = area.warehouse?.id;
          if (warehouseId) {
            if (!areasMap[warehouseId]) {
              areasMap[warehouseId] = [];
            }
            areasMap[warehouseId].push(area);

            // Parse environment data từ IoT devices
            const iot = (area as any)?.iotDevice;
            const devices: any[] = Array.isArray(iot) ? iot : iot ? [iot] : [];
            let readings: {
              temperature?: number | null;
              humidity?: number | null;
            } = {
              temperature: null,
              humidity: null
            };

            for (const d of devices) {
              const r = parseDeviceData(d);
              const temperature = toNumeric(r.temperature);
              const humidity = toNumeric(r.humidity);
              if (temperature != null || humidity != null) {
                readings = { temperature, humidity };
                break;
              }
            }

            envMap[area.id] = readings;
          }
        }

        // Group batches theo warehouseId (thông qua area.warehouse.id)
        const batchesMap: Record<string, Batch[]> = {};
        for (const batch of allBatches) {
          const areaId = batch.area?.id;
          if (areaId) {
            // Tìm area tương ứng để lấy warehouseId
            const area = allAreas.find((a) => a.id === areaId);
            const warehouseId = area?.warehouse?.id;
            if (warehouseId) {
              if (!batchesMap[warehouseId]) {
                batchesMap[warehouseId] = [];
              }
              batchesMap[warehouseId].push(batch);
            }
          }
        }

        setWarehouseAreas(areasMap);
        setWarehouseBatches(batchesMap);
        setAreaEnv(envMap);
      } catch (error) {
        console.error('Unable to load warehouses', error);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    void loadWarehouses();
  }, []);

  // Subscribe IoT updates
  useEffect(() => {
    const unsubscribe = subscribeIoTDataUpdates((payload) => {
      const readings = parseDeviceData(payload as any);
      const temperature = toNumeric(readings.temperature);
      const humidity = toNumeric(readings.humidity);
      if (temperature == null && humidity == null) return;

      const payloadAreaId = (payload as any)?.area?.id as string | undefined;
      if (!payloadAreaId) return;

      setAreaEnv((prev) => ({
        ...prev,
        [payloadAreaId]: {
          temperature:
            temperature != null
              ? temperature
              : (prev[payloadAreaId]?.temperature ?? null),
          humidity:
            humidity != null
              ? humidity
              : (prev[payloadAreaId]?.humidity ?? null)
        }
      }));
    });

    return () => {
      unsubscribe();
    };
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

        {/* Danh sách kho */}
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {mergedWarehouses.map((warehouse) => (
              <Card
                key={warehouse.id}
                className='flex h-full flex-col transition-shadow hover:shadow-lg'
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
                <CardContent className='flex flex-1 flex-col space-y-4'>
                  {/* Thống kê kho */}
                  {/* <div className='grid grid-cols-2 gap-4 text-sm'>
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
                  </div> */}

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
                  <div className='flex-1 space-y-2'>
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
                                {area.temperature != null
                                  ? `${area.temperature}°C`
                                  : '—'}
                              </span>
                              <span className='flex items-center dark:text-black'>
                                <IconDroplet className='mr-1 h-3 w-3' />
                                {area.humidity != null
                                  ? `${area.humidity}%`
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='mt-auto flex gap-2 pt-4'>
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
