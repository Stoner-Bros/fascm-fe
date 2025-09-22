'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  IconBuilding,
  IconMapPin,
  IconTemperature,
  IconDroplet,
  IconPackage,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconSettings,
  IconUsers,
  IconClock,
  IconBarcode,
  IconScale,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconSearch
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Warehouse, Area } from '@/types/inventory';

interface WarehouseAreaSelectorProps {
  warehouses: Warehouse[];
  selectedWarehouseId?: string;
  selectedAreaId?: string;
  onWarehouseChange?: (warehouseId: string) => void;
  onAreaChange?: (areaId: string) => void;
  showDetails?: boolean;
  className?: string;
}

export function WarehouseAreaSelector({
  warehouses,
  selectedWarehouseId,
  selectedAreaId,
  onWarehouseChange,
  onAreaChange,
  showDetails = true,
  className
}: WarehouseAreaSelectorProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaSearchTerm, setAreaSearchTerm] = useState('');

  // Cập nhật warehouse được chọn
  useEffect(() => {
    if (selectedWarehouseId) {
      const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);
      setSelectedWarehouse(warehouse || null);
    } else {
      setSelectedWarehouse(null);
    }
  }, [selectedWarehouseId, warehouses]);

  // Cập nhật area được chọn
  useEffect(() => {
    if (selectedAreaId && selectedWarehouse) {
      const area = selectedWarehouse.areas.find((a) => a.id === selectedAreaId);
      setSelectedArea(area || null);
    } else {
      setSelectedArea(null);
    }
  }, [selectedAreaId, selectedWarehouse]);

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouses.find((w) => w.id === warehouseId) || null);
    setSelectedArea(null);
    onWarehouseChange?.(warehouseId);
    onAreaChange?.('');
  };

  const handleAreaChange = (areaId: string) => {
    if (selectedWarehouse) {
      const area = selectedWarehouse.areas.find((a) => a.id === areaId);
      setSelectedArea(area || null);
      onAreaChange?.(areaId);
    }
  };

  // Tính toán thống kê warehouse
  const getWarehouseStats = (warehouse: Warehouse) => {
    const totalCapacity = warehouse.areas.reduce(
      (sum, area) => sum + area.capacity,
      0
    );
    const totalOccupied = warehouse.areas.reduce(
      (sum, area) => sum + area.currentStock,
      0
    );
    const occupancyRate =
      totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      totalOccupied,
      occupancyRate,
      availableSpace: totalCapacity - totalOccupied,
      totalAreas: warehouse.areas.length,
      activeAreas: warehouse.areas.filter((a) => a.status === 'normal').length
    };
  };

  // Tính toán thống kê area
  const getAreaStats = (area: Area) => {
    const occupancyRate =
      area.capacity > 0 ? (area.currentStock / area.capacity) * 100 : 0;
    const availableSpace = area.capacity - area.currentStock;

    return {
      occupancyRate,
      availableSpace,
      isNearCapacity: occupancyRate >= 90,
      isOverCapacity: occupancyRate > 100
    };
  };

  // Xác định màu sắc trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'warning':
        return 'Cảnh báo';
      case 'critical':
        return 'Nguy hiểm';
      case 'active':
        return 'Hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      case 'inactive':
        return 'Ngừng hoạt động';
      default:
        return 'Không xác định';
    }
  };

  // Xác định màu sắc theo mức độ sử dụng
  const getOccupancyColor = (rate: number) => {
    if (rate >= 95) return 'text-red-600';
    if (rate >= 80) return 'text-orange-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Lọc warehouses theo search term
  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc areas theo search term
  const filteredAreas = selectedWarehouse
    ? selectedWarehouse.areas.filter(
        (area) =>
          area.name.toLowerCase().includes(areaSearchTerm.toLowerCase()) ||
          area.type.toLowerCase().includes(areaSearchTerm.toLowerCase())
      )
    : [];

  // Render area selector dựa trên số lượng
  const renderAreaSelector = () => {
    if (!selectedWarehouse) return null;

    const areas = selectedWarehouse.areas;

    if (areas.length <= 3) {
      // Render radio buttons nằm ngang
      return (
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Khu vực</label>
          <RadioGroup
            value={selectedAreaId || ''}
            onValueChange={handleAreaChange}
            className='flex flex-row gap-4'
          >
            {areas.map((area) => {
              const stats = getAreaStats(area);
              return (
                <div key={area.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={area.id} id={area.id} />
                  <Label
                    htmlFor={area.id}
                    className='hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors'
                  >
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        <IconMapPin className='h-4 w-4' />
                        <span className='font-medium'>{area.name}</span>
                        <Badge
                          className={getStatusColor(area.status)}
                          variant='outline'
                        >
                          {getStatusText(area.status)}
                        </Badge>
                        {stats.isNearCapacity && (
                          <Tooltip>
                            <TooltipTrigger>
                              <IconAlertTriangle className='h-4 w-4 text-orange-500' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Gần đầy</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs'>
                        {stats.occupancyRate.toFixed(1)}% sử dụng
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      );
    } else {
      // Render Select với search
      return (
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Khu vực</label>
          <div className='space-y-2'>
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Tìm kiếm khu vực...'
                value={areaSearchTerm}
                onChange={(e) => setAreaSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={selectedAreaId || ''}
              onValueChange={handleAreaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn khu vực...' />
              </SelectTrigger>
              <SelectContent>
                {filteredAreas.map((area) => {
                  const stats = getAreaStats(area);
                  return (
                    <SelectItem key={area.id} value={area.id}>
                      <div className='flex w-full items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <IconMapPin className='h-4 w-4' />
                          <span>{area.name}</span>
                          <Badge
                            className={getStatusColor(area.status)}
                            variant='outline'
                          >
                            {getStatusText(area.status)}
                          </Badge>
                          {stats.isNearCapacity && (
                            <Tooltip>
                              <TooltipTrigger>
                                <IconAlertTriangle className='h-4 w-4 text-orange-500' />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Gần đầy</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className='text-muted-foreground ml-4 text-xs'>
                          {stats.occupancyRate.toFixed(1)}% sử dụng
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
                {filteredAreas.length === 0 && (
                  <div className='text-muted-foreground p-2 text-center text-sm'>
                    Không tìm thấy khu vực nào
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
  };

  // Render warehouse selector dựa trên số lượng
  const renderWarehouseSelector = () => {
    if (warehouses.length <= 3) {
      // Render radio buttons nằm ngang
      return (
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Kho hàng</label>
          <RadioGroup
            value={selectedWarehouseId || ''}
            onValueChange={handleWarehouseChange}
            className='flex flex-row gap-4'
          >
            {warehouses.map((warehouse) => {
              const stats = getWarehouseStats(warehouse);
              return (
                <div key={warehouse.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={warehouse.id} id={warehouse.id} />
                  <Label
                    htmlFor={warehouse.id}
                    className='hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors'
                  >
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        <IconBuilding className='h-4 w-4' />
                        <span className='font-medium'>{warehouse.name}</span>
                        <Badge
                          className={getStatusColor(warehouse.status)}
                          variant='outline'
                        >
                          {getStatusText(warehouse.status)}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs'>
                        {stats.occupancyRate.toFixed(1)}% sử dụng
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      );
    } else {
      // Render Select với search
      return (
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Kho hàng</label>
          <div className='space-y-2'>
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Tìm kiếm kho hàng...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={selectedWarehouseId || ''}
              onValueChange={handleWarehouseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn kho hàng...' />
              </SelectTrigger>
              <SelectContent>
                {filteredWarehouses.map((warehouse) => {
                  const stats = getWarehouseStats(warehouse);
                  return (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      <div className='flex w-full items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <IconBuilding className='h-4 w-4' />
                          <span>{warehouse.name}</span>
                          <Badge
                            className={getStatusColor(warehouse.status)}
                            variant='outline'
                          >
                            {getStatusText(warehouse.status)}
                          </Badge>
                        </div>
                        <div className='text-muted-foreground ml-4 text-xs'>
                          {stats.occupancyRate.toFixed(1)}% sử dụng
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
                {filteredWarehouses.length === 0 && (
                  <div className='text-muted-foreground p-2 text-center text-sm'>
                    Không tìm thấy kho hàng nào
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconBuilding className='h-5 w-5' />
            Chọn kho và khu vực
          </CardTitle>
          <CardDescription>
            Chọn kho hàng và khu vực cụ thể để quản lý tồn kho
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Chọn kho - UI động */}
          {renderWarehouseSelector()}

          {/* Thông tin chi tiết kho */}
          {selectedWarehouse && showDetails && (
            <Card className='bg-muted/50'>
              <CardContent className='space-y-4 p-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='flex items-center gap-2 font-medium'>
                    <IconBuilding className='h-4 w-4' />
                    {selectedWarehouse.name}
                  </h4>
                  <div className='flex items-center gap-2'>
                    <Badge
                      className={getStatusColor(selectedWarehouse.status)}
                      variant='outline'
                    >
                      {getStatusText(selectedWarehouse.status)}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <IconSettings className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cài đặt kho</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  {(() => {
                    const stats = getWarehouseStats(selectedWarehouse);
                    return (
                      <>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {stats.totalAreas}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Khu vực
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {stats.activeAreas}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Hoạt động
                          </div>
                        </div>
                        <div className='text-center'>
                          <div
                            className={cn(
                              'text-2xl font-bold',
                              getOccupancyColor(stats.occupancyRate)
                            )}
                          >
                            {stats.occupancyRate.toFixed(1)}%
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Sử dụng
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {stats.availableSpace.toLocaleString()}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            m² còn lại
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Tỷ lệ sử dụng</span>
                    <span>
                      {getWarehouseStats(
                        selectedWarehouse
                      ).occupancyRate.toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={getWarehouseStats(selectedWarehouse).occupancyRate}
                    className='h-2'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <IconMapPin className='text-muted-foreground h-4 w-4' />
                    <span className='text-muted-foreground'>Địa chỉ:</span>
                    <span>{selectedWarehouse.location}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconUsers className='text-muted-foreground h-4 w-4' />
                    <span className='text-muted-foreground'>Quản lý:</span>
                    <span>{selectedWarehouse.manager}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chọn khu vực */}
          {selectedWarehouse && renderAreaSelector()}

          {/* Thông tin chi tiết khu vực */}
          {selectedArea && showDetails && (
            <Card className='bg-muted/50'>
              <CardContent className='space-y-4 p-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='flex items-center gap-2 font-medium'>
                    <IconMapPin className='h-4 w-4' />
                    {selectedArea.name}
                  </h4>
                  <div className='flex items-center gap-2'>
                    <Badge
                      className={getStatusColor(selectedArea.status)}
                      variant='outline'
                    >
                      {getStatusText(selectedArea.status)}
                    </Badge>
                    {(() => {
                      const stats = getAreaStats(selectedArea);
                      if (stats.isOverCapacity) {
                        return (
                          <Tooltip>
                            <TooltipTrigger>
                              <IconX className='h-4 w-4 text-red-500' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vượt quá sức chứa</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      if (stats.isNearCapacity) {
                        return (
                          <Tooltip>
                            <TooltipTrigger>
                              <IconAlertTriangle className='h-4 w-4 text-orange-500' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Gần đầy</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return (
                        <Tooltip>
                          <TooltipTrigger>
                            <IconCheck className='h-4 w-4 text-green-500' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Còn chỗ trống</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  {(() => {
                    const stats = getAreaStats(selectedArea);
                    return (
                      <>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {selectedArea.capacity.toLocaleString()}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Sức chứa (m²)
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {selectedArea.currentStock.toLocaleString()}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Đã sử dụng (m²)
                          </div>
                        </div>
                        <div className='text-center'>
                          <div
                            className={cn(
                              'text-2xl font-bold',
                              getOccupancyColor(stats.occupancyRate)
                            )}
                          >
                            {stats.occupancyRate.toFixed(1)}%
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Tỷ lệ sử dụng
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold'>
                            {stats.availableSpace.toLocaleString()}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Còn lại (m²)
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Tỷ lệ sử dụng</span>
                    <span>
                      {getAreaStats(selectedArea).occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={getAreaStats(selectedArea).occupancyRate}
                    className='h-2'
                  />
                </div>

                <Separator />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium'>
                      Điều kiện môi trường
                    </h5>
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <IconTemperature className='h-4 w-4 text-blue-500' />
                          <span>Nhiệt độ:</span>
                        </div>
                        <span className='font-medium'>
                          {selectedArea.temperature}°C
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <IconDroplet className='h-4 w-4 text-blue-500' />
                          <span>Độ ẩm:</span>
                        </div>
                        <span className='font-medium'>
                          {selectedArea.humidity}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium'>Thông tin khác</h5>
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <IconPackage className='h-4 w-4 text-green-500' />
                          <span>Sản phẩm:</span>
                        </div>
                        <span className='font-medium'>
                          {selectedArea.products.length}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <IconActivity className='h-4 w-4 text-purple-500' />
                          <span>Trạng thái:</span>
                        </div>
                        <Badge
                          className={getStatusColor(selectedArea.status)}
                          variant='outline'
                        >
                          {getStatusText(selectedArea.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedArea.description && (
                  <>
                    <Separator />
                    <div>
                      <h5 className='mb-1 text-sm font-medium'>Mô tả</h5>
                      <p className='text-muted-foreground text-sm'>
                        {selectedArea.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
