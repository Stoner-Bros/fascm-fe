'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  IconPackage,
  IconPlus,
  IconWeight,
  IconCube,
  IconUsers,
  IconTruck,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconMapPin
} from '@tabler/icons-react';
import { useState } from 'react';
import { Order, Truck, WeightCapacityValidation } from '@/types/delivery';

interface OrderManagementProps {
  availableOrders: Order[];
  availableTrucks: Truck[];
  onCreateDelivery: (orders: Order[], truck: Truck) => void;
}

export function OrderManagement({
  availableOrders,
  availableTrucks,
  onCreateDelivery
}: OrderManagementProps) {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [validation, setValidation] = useState<WeightCapacityValidation | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Weight/Capacity validation function
  const validateWeightCapacity = (
    orders: Order[],
    truck: Truck
  ): WeightCapacityValidation => {
    const totalWeight = orders.reduce(
      (sum, order) => sum + order.totalWeight,
      0
    );
    const totalVolume = orders.reduce(
      (sum, order) => sum + order.totalVolume,
      0
    );

    const errors: WeightCapacityValidation['errors'] = [];
    const warnings: WeightCapacityValidation['warnings'] = [];

    // Check weight limit
    if (totalWeight > truck.maxWeight) {
      errors.push({
        type: 'weight_exceeded',
        message: `Tổng trọng lượng vượt quá giới hạn xe tải`,
        currentValue: totalWeight,
        maxValue: truck.maxWeight,
        unit: 'kg'
      });
    } else if (totalWeight > truck.maxWeight * 0.9) {
      warnings.push({
        type: 'near_limit',
        message: `Gần đạt giới hạn trọng lượng`,
        percentage: (totalWeight / truck.maxWeight) * 100
      });
    }

    // Check capacity limit
    if (totalWeight > truck.capacity) {
      errors.push({
        type: 'capacity_exceeded',
        message: `Tổng trọng lượng vượt quá khả năng chở của xe`,
        currentValue: totalWeight,
        maxValue: truck.capacity,
        unit: 'kg'
      });
    } else if (totalWeight > truck.capacity * 0.9) {
      warnings.push({
        type: 'near_limit',
        message: `Gần đạt giới hạn khả năng chở`,
        percentage: (totalWeight / truck.capacity) * 100
      });
    }

    // Check volume limit
    if (totalVolume > truck.volume) {
      errors.push({
        type: 'volume_exceeded',
        message: `Tổng thể tích vượt quá không gian chứa của xe`,
        currentValue: totalVolume,
        maxValue: truck.volume,
        unit: 'm³'
      });
    } else if (totalVolume > truck.volume * 0.9) {
      warnings.push({
        type: 'near_limit',
        message: `Gần đạt giới hạn thể tích`,
        percentage: (totalVolume / truck.volume) * 100
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleOrderSelection = (order: Order, isSelected: boolean) => {
    let newSelectedOrders: Order[];

    if (isSelected) {
      newSelectedOrders = [...selectedOrders, order];
    } else {
      newSelectedOrders = selectedOrders.filter((o) => o.id !== order.id);
    }

    setSelectedOrders(newSelectedOrders);

    // Validate if truck is selected
    if (selectedTruckId && newSelectedOrders.length > 0) {
      const selectedTruck = availableTrucks.find(
        (t) => t.id === selectedTruckId
      );
      if (selectedTruck) {
        const validation = validateWeightCapacity(
          newSelectedOrders,
          selectedTruck
        );
        setValidation(validation);
      }
    } else {
      setValidation(null);
    }
  };

  const handleTruckChange = (truckId: string) => {
    setSelectedTruckId(truckId);

    // Validate with current orders
    if (selectedOrders.length > 0) {
      const selectedTruck = availableTrucks.find((t) => t.id === truckId);
      if (selectedTruck) {
        const validation = validateWeightCapacity(
          selectedOrders,
          selectedTruck
        );
        setValidation(validation);
      }
    }
  };

  const handleCreateDelivery = () => {
    if (!selectedTruckId) {
      alert('Vui lòng chọn xe tải');
      return;
    }

    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    const selectedTruck = availableTrucks.find((t) => t.id === selectedTruckId);
    if (!selectedTruck) {
      alert('Xe tải không hợp lệ');
      return;
    }

    // Final validation
    const finalValidation = validateWeightCapacity(
      selectedOrders,
      selectedTruck
    );
    if (!finalValidation.isValid) {
      alert(
        'Vượt quá giới hạn tải trọng hoặc thể tích của xe. Vui lòng điều chỉnh đơn hàng.'
      );
      return;
    }

    onCreateDelivery(selectedOrders, selectedTruck);

    // Reset form
    setSelectedOrders([]);
    setSelectedTruckId('');
    setValidation(null);
    setIsDialogOpen(false);
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-700'>
            Chờ xử lý
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-700'>
            Đã xác nhận
          </Badge>
        );
      case 'packed':
        return (
          <Badge variant='outline' className='bg-yellow-50 text-yellow-700'>
            Đã đóng gói
          </Badge>
        );
      case 'assigned':
        return (
          <Badge variant='outline' className='bg-purple-50 text-purple-700'>
            Đã phân xe
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant='outline' className='bg-orange-50 text-orange-700'>
            Đang giao
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700'>
            Đã giao
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700'>
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: Order['priority']) => {
    switch (priority) {
      case 'low':
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-600'>
            Thấp
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-600'>
            Trung bình
          </Badge>
        );
      case 'high':
        return (
          <Badge variant='outline' className='bg-orange-50 text-orange-600'>
            Cao
          </Badge>
        );
      case 'urgent':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-600'>
            Khẩn cấp
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const confirmedOrders = availableOrders.filter(
    (order) => order.status === 'confirmed'
  );
  const totalSelectedWeight = selectedOrders.reduce(
    (sum, order) => sum + order.totalWeight,
    0
  );
  const totalSelectedVolume = selectedOrders.reduce(
    (sum, order) => sum + order.totalVolume,
    0
  );
  const totalSelectedValue = selectedOrders.reduce(
    (sum, order) => sum + order.totalValue,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <IconPackage className='h-5 w-5' />
              Quản lý Đơn hàng Xuất kho
            </CardTitle>
            <CardDescription>
              Chọn đơn hàng và xe tải để tạo đợt vận chuyển xuất kho
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo đợt vận chuyển
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Tạo đợt vận chuyển xuất kho</DialogTitle>
                <DialogDescription>
                  Chọn đơn hàng và xe tải. Hệ thống sẽ kiểm tra tải trọng và thể
                  tích tự động.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Truck Selection */}
                <div className='space-y-2'>
                  <Label>Chọn xe tải</Label>
                  <Select
                    value={selectedTruckId}
                    onValueChange={handleTruckChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn xe tải khả dụng' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTrucks
                        .filter((truck) => truck.status === 'available')
                        .map((truck) => (
                          <SelectItem key={truck.id} value={truck.id}>
                            <div className='flex flex-col'>
                              <div className='font-medium'>
                                {truck.licenseNumber} - {truck.model}
                              </div>
                              <div className='text-muted-foreground text-sm'>
                                Tải trọng: {truck.capacity}kg | Giới hạn:{' '}
                                {truck.maxWeight}kg | Thể tích: {truck.volume}m³
                              </div>
                              <div className='text-muted-foreground text-sm'>
                                Nhân viên: {truck.transportStaff.length} người
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Truck Info */}
                {selectedTruckId && (
                  <Card className='bg-muted/20'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <IconTruck className='h-4 w-4' />
                        Thông tin xe tải đã chọn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const selectedTruck = availableTrucks.find(
                          (t) => t.id === selectedTruckId
                        );
                        if (!selectedTruck) return null;

                        return (
                          <div className='space-y-3'>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='font-medium'>Biển số:</span>{' '}
                                {selectedTruck.licenseNumber}
                              </div>
                              <div>
                                <span className='font-medium'>Model:</span>{' '}
                                {selectedTruck.model}
                              </div>
                              <div className='flex items-center gap-2'>
                                <IconWeight className='h-4 w-4' />
                                <span className='font-medium'>
                                  Tải trọng:
                                </span>{' '}
                                {selectedTruck.capacity}kg
                              </div>
                              <div className='flex items-center gap-2'>
                                <IconWeight className='h-4 w-4' />
                                <span className='font-medium'>
                                  Giới hạn:
                                </span>{' '}
                                {selectedTruck.maxWeight}kg
                              </div>
                              <div className='flex items-center gap-2'>
                                <IconCube className='h-4 w-4' />
                                <span className='font-medium'>
                                  Thể tích:
                                </span>{' '}
                                {selectedTruck.volume}m³
                              </div>
                              <div className='flex items-center gap-2'>
                                <IconUsers className='h-4 w-4' />
                                <span className='font-medium'>
                                  Nhân viên:
                                </span>{' '}
                                {selectedTruck.transportStaff.length} người
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Order Selection */}
                <div className='space-y-2'>
                  <Label>Chọn đơn hàng (có thể chọn nhiều)</Label>
                  <div className='max-h-60 overflow-y-auto rounded-lg border p-4'>
                    {confirmedOrders.length === 0 ? (
                      <p className='text-muted-foreground py-4 text-center'>
                        Không có đơn hàng nào sẵn sàng để vận chuyển
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {confirmedOrders.map((order) => (
                          <div
                            key={order.id}
                            className='hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3'
                          >
                            <input
                              type='checkbox'
                              checked={selectedOrders.some(
                                (o) => o.id === order.id
                              )}
                              onChange={(e) =>
                                handleOrderSelection(order, e.target.checked)
                              }
                              className='rounded'
                            />
                            <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <div className='font-medium'>
                                    {order.id} - {order.customerName}
                                  </div>
                                  <div className='text-muted-foreground text-sm'>
                                    {order.items.length} sản phẩm |{' '}
                                    {order.totalWeight}kg | {order.totalVolume}
                                    m³ | {formatCurrency(order.totalValue)}
                                  </div>
                                </div>
                                <div className='flex gap-2'>
                                  {getPriorityBadge(order.priority)}
                                  {getOrderStatusBadge(order.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Orders Summary */}
                {selectedOrders.length > 0 && (
                  <Card className='bg-blue-50/50'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm'>
                        Tổng kết đơn hàng đã chọn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-4 gap-4 text-sm'>
                        <div>
                          <span className='font-medium'>Số đơn:</span>{' '}
                          {selectedOrders.length}
                        </div>
                        <div className='flex items-center gap-1'>
                          <IconWeight className='h-4 w-4' />
                          <span className='font-medium'>
                            Tổng trọng lượng:
                          </span>{' '}
                          {totalSelectedWeight}kg
                        </div>
                        <div className='flex items-center gap-1'>
                          <IconCube className='h-4 w-4' />
                          <span className='font-medium'>
                            Tổng thể tích:
                          </span>{' '}
                          {totalSelectedVolume}m³
                        </div>
                        <div>
                          <span className='font-medium'>Tổng giá trị:</span>{' '}
                          {formatCurrency(totalSelectedValue)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Validation Results */}
                {validation && (
                  <Card
                    className={
                      validation.isValid ? 'bg-green-50/50' : 'bg-red-50/50'
                    }
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        {validation.isValid ? (
                          <IconCheck className='h-4 w-4 text-green-600' />
                        ) : (
                          <IconX className='h-4 w-4 text-red-600' />
                        )}
                        Kết quả kiểm tra tải trọng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      {validation.errors.map((error, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 text-sm text-red-700'
                        >
                          <IconAlertTriangle className='h-4 w-4' />
                          <span>
                            {error.message}: {error.currentValue}
                            {error.unit} / {error.maxValue}
                            {error.unit}
                          </span>
                        </div>
                      ))}
                      {validation.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 text-sm text-orange-700'
                        >
                          <IconAlertTriangle className='h-4 w-4' />
                          <span>
                            {warning.message}: {warning.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                      {validation.isValid &&
                        validation.errors.length === 0 &&
                        validation.warnings.length === 0 && (
                          <div className='flex items-center gap-2 text-sm text-green-700'>
                            <IconCheck className='h-4 w-4' />
                            <span>Tất cả giới hạn đều được tuân thủ</span>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateDelivery}
                  disabled={
                    !selectedTruckId ||
                    selectedOrders.length === 0 ||
                    (validation && !validation.isValid)
                  }
                >
                  Tạo đợt vận chuyển
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Orders Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Trọng lượng & Thể tích</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {confirmedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='font-medium'>{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className='font-medium'>{order.customerName}</div>
                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                      <IconMapPin className='h-3 w-3' />
                      {order.customerAddress}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    {order.items.map((item, index) => (
                      <div key={item.id}>
                        {item.productName} ({item.quantity} {item.unit})
                        {index < order.items.length - 1 && ', '}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='flex items-center gap-1'>
                      <IconWeight className='h-3 w-3' />
                      {order.totalWeight}kg
                    </div>
                    <div className='flex items-center gap-1'>
                      <IconCube className='h-3 w-3' />
                      {order.totalVolume}m³
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(order.totalValue)}</TableCell>
                <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
