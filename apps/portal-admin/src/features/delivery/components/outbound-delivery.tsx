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
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
import type {
  Order,
  OutboundDelivery,
  Truck,
  WeightCapacityValidation
} from '@/types/delivery';
import {
  IconActivity,
  IconBuilding,
  IconClock,
  IconDownload,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTruck
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock truck data (same as inbound)
const mockTrucks: Truck[] = [
  {
    id: 'TRUCK-001',
    licenseNumber: 'HY-29A-12345',
    model: 'Hyundai H350 Refrigerated',
    capacity: 2000,
    maxWeight: 2500,
    volume: 15.5,
    fuelType: 'diesel',
    status: 'available',
    gpsDevice: {
      deviceId: 'GPS-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-001',
      humiditySensorId: 'HUM-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-001',
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        role: 'driver',
        licenseNumber: 'B2-123456789',
        experience: 5
      },
      {
        id: 'STAFF-002',
        name: 'Trần Văn B',
        phone: '0976543210',
        role: 'assistant',
        experience: 3
      }
    ],
    registrationExpiry: '2025-12-31'
  },
  {
    id: 'TRUCK-002',
    licenseNumber: 'HN-30B-67890',
    model: 'Isuzu NPR Cooler Truck',
    capacity: 1500,
    maxWeight: 2000,
    volume: 12.0,
    fuelType: 'diesel',
    status: 'available',
    gpsDevice: {
      deviceId: 'GPS-002',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-002',
      humiditySensorId: 'HUM-002',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-003',
        name: 'Lê Văn C',
        phone: '0965432109',
        role: 'driver',
        licenseNumber: 'C-987654321',
        experience: 8
      },
      {
        id: 'STAFF-004',
        name: 'Phạm Văn D',
        phone: '0954321098',
        role: 'assistant',
        experience: 2
      }
    ],
    registrationExpiry: '2025-08-15'
  }
];

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customerId: 'CUST-001',
    customerName: 'Siêu thị BigC',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    customerContact: '0281234567',
    customerType: 'supermarket',
    items: [
      {
        id: 'ITEM-001',
        productId: 'PROD-001',
        productName: 'Rau lá tươi',
        quantity: 100,
        unit: 'kg',
        weight: 100,
        volume: 1.5,
        specialRequirements: 'Bảo quản lạnh 2-4°C'
      },
      {
        id: 'ITEM-002',
        productId: 'PROD-002',
        productName: 'Củ cải trắng',
        quantity: 50,
        unit: 'kg',
        weight: 50,
        volume: 0.8
      }
    ],
    totalWeight: 150,
    totalVolume: 2.3,
    totalValue: 4500000,
    deliveryDate: '2024-09-18T14:00:00',
    priority: 'high',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T08:00:00',
    updatedAt: '2024-09-17T10:00:00'
  },
  {
    id: 'ORD-2024-002',
    customerId: 'CUST-002',
    customerName: 'Nhà hàng Hải Sản Tươi',
    customerAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
    customerContact: '0287654321',
    customerType: 'restaurant',
    items: [
      {
        id: 'ITEM-003',
        productId: 'PROD-003',
        productName: 'Hải sản đông lạnh',
        quantity: 80,
        unit: 'kg',
        weight: 80,
        volume: 1.2,
        specialRequirements: 'Đông lạnh -2°C'
      }
    ],
    totalWeight: 80,
    totalVolume: 1.2,
    totalValue: 2400000,
    deliveryDate: '2024-09-18T11:30:00',
    priority: 'urgent',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T15:00:00',
    updatedAt: '2024-09-17T16:00:00'
  },
  {
    id: 'ORD-2024-003',
    customerId: 'CUST-003',
    customerName: 'Kho bãi Miền Tây',
    customerAddress: '789 Quốc lộ 1A, Cần Thơ',
    customerContact: '0292345678',
    customerType: 'distributor',
    items: [
      {
        id: 'ITEM-004',
        productId: 'PROD-004',
        productName: 'Thực phẩm khô',
        quantity: 200,
        unit: 'kg',
        weight: 200,
        volume: 2.5
      }
    ],
    totalWeight: 200,
    totalVolume: 2.5,
    totalValue: 3000000,
    deliveryDate: '2024-09-18T16:00:00',
    priority: 'medium',
    requiresSignature: false,
    status: 'pending',
    createdAt: '2024-09-17T12:00:00',
    updatedAt: '2024-09-17T12:00:00'
  }
];

export function OutboundDelivery() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([
    {
      id: 'OUT-2024-001',
      warehouseId: 'WH-001',
      warehouseName: 'Kho Trung tâm Hà Nội',
      warehouseAddress: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      truckId: 'TRUCK-001',
      truck: mockTrucks[0],
      orders: [mockOrders[0]],
      totalWeight: 150,
      totalVolume: 2.3,
      totalValue: 4500000,
      departureTime: '2024-09-18T06:00:00',
      estimatedArrival: '2024-09-18T14:00:00',
      actualArrival: '2024-09-18T13:45:00',
      status: 'completed',
      monitoring: {
        truckId: 'TRUCK-001',
        location: {
          latitude: 10.7769,
          longitude: 106.7009,
          address: 'Siêu thị BigC, Quận 1, TP.HCM',
          timestamp: '2024-09-18T13:45:00'
        },
        environment: {
          temperature: 4.5,
          humidity: 65,
          timestamp: '2024-09-18T13:45:00'
        },
        speed: 0,
        fuel: 75,
        isMoving: false,
        lastUpdate: '2024-09-18T13:45:00'
      },
      route: [
        {
          orderId: 'ORD-2024-001',
          customerName: 'Siêu thị BigC',
          customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          estimatedArrival: '2024-09-18T14:00:00',
          actualArrival: '2024-09-18T13:45:00',
          status: 'delivered'
        }
      ],
      priorityLevel: 'high',
      specialHandling: 'Bảo quản lạnh',
      notes:
        'Giao hàng thành công, đã có chữ ký xác nhận. Xe có 2 nhân viên vận chuyển.',
      createdAt: '2024-09-17T08:00:00',
      updatedAt: '2024-09-18T14:00:00'
    },
    {
      id: 'OUT-2024-002',
      warehouseId: 'WH-002',
      warehouseName: 'Kho Lạnh Thanh Xuân',
      warehouseAddress: 'Số 456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
      truckId: 'TRUCK-002',
      truck: mockTrucks[1],
      orders: [mockOrders[1]],
      totalWeight: 80,
      totalVolume: 1.2,
      totalValue: 2400000,
      departureTime: '2024-09-18T07:30:00',
      estimatedArrival: '2024-09-18T11:30:00',
      status: 'in_transit',
      monitoring: {
        truckId: 'TRUCK-002',
        location: {
          latitude: 10.7829,
          longitude: 106.6831,
          address: 'Đường Điện Biên Phủ, Quận 3, TP.HCM',
          timestamp: '2024-09-18T10:45:00'
        },
        environment: {
          temperature: -1.8,
          humidity: 45,
          timestamp: '2024-09-18T10:45:00'
        },
        speed: 35,
        fuel: 68,
        isMoving: true,
        lastUpdate: '2024-09-18T10:45:00'
      },
      route: [
        {
          orderId: 'ORD-2024-002',
          customerName: 'Nhà hàng Hải Sản Tươi',
          customerAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
          estimatedArrival: '2024-09-18T11:30:00',
          status: 'pending'
        }
      ],
      priorityLevel: 'urgent',
      specialHandling: 'Đông lạnh -2°C',
      notes:
        'Đang trên đường giao, nhiệt độ ổn định. Đội ngũ 2 nhân viên vận chuyển.',
      createdAt: '2024-09-17T15:00:00',
      updatedAt: '2024-09-18T09:00:00'
    },
    {
      id: 'OUT-2024-003',
      warehouseId: 'WH-003',
      warehouseName: 'Kho Nông sản Đông Anh',
      warehouseAddress: 'Khu Công nghiệp Đông Anh, Đông Anh, Hà Nội',
      truckId: 'TRUCK-001',
      truck: mockTrucks[0],
      orders: [mockOrders[2]],
      totalWeight: 200,
      totalVolume: 2.5,
      totalValue: 3000000,
      departureTime: '2024-09-18T05:00:00',
      estimatedArrival: '2024-09-18T12:00:00',
      status: 'loading',
      route: [
        {
          orderId: 'ORD-2024-003',
          customerName: 'Kho bãi Miền Tây',
          customerAddress: '789 Quốc lộ 1A, Cần Thơ',
          estimatedArrival: '2024-09-18T16:00:00',
          status: 'pending'
        }
      ],
      priorityLevel: 'medium',
      notes:
        'Đang tiến hành đóng gói và chất hàng. Xe tải có GPS và cảm biến giám sát.',
      createdAt: '2024-09-17T12:00:00',
      updatedAt: '2024-09-18T05:30:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [validation, setValidation] = useState<WeightCapacityValidation | null>(
    null
  );

  // Warehouse options
  const warehouseOptions = [
    {
      id: 'WH-001',
      name: 'Kho Trung tâm Hà Nội',
      address: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội'
    },
    {
      id: 'WH-002',
      name: 'Kho Lạnh Thanh Xuân',
      address: 'Số 456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội'
    },
    {
      id: 'WH-003',
      name: 'Kho Nông sản Đông Anh',
      address: 'Khu Công nghiệp Đông Anh, Đông Anh, Hà Nội'
    },
    {
      id: 'WH-004',
      name: 'Kho Miền Bắc',
      address: 'Số 789 Đường Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội'
    }
  ];

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

  // Form states
  const [formData, setFormData] = useState<Partial<OutboundDelivery>>({
    warehouseId: '',
    warehouseName: '',
    warehouseAddress: '',
    truckId: '',
    orders: [],
    totalWeight: 0,
    totalVolume: 0,
    totalValue: 0,
    departureTime: '',
    estimatedArrival: '',
    priorityLevel: 'medium',
    specialHandling: '',
    notes: ''
  });

  const getStatusBadge = (status: OutboundDelivery['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className='border-gray-200 bg-gray-100 text-gray-700'>
            Đã lên lịch
          </Badge>
        );
      case 'loading':
        return (
          <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
            Đang chất hàng
          </Badge>
        );
      case 'departed':
        return (
          <Badge className='border-orange-200 bg-orange-100 text-orange-700'>
            Đã khởi hành
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'delivering':
        return (
          <Badge className='border-purple-200 bg-purple-100 text-purple-700'>
            Đang giao hàng
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Hoàn thành
          </Badge>
        );
      case 'returned':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Đã trả về
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: OutboundDelivery['priorityLevel']) => {
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

  const filteredDeliveries = deliveries.filter((delivery) => {
    const customerNames = delivery.orders
      .map((order) => order.customerName)
      .join(' ');
    const matchesSearch =
      customerNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orders.some((order) =>
        order.items.some((item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    const matchesStatus =
      statusFilter === 'all' || delivery.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || delivery.priorityLevel === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleWarehouseChange = (warehouseId: string) => {
    const selectedWarehouse = warehouseOptions.find(
      (wh) => wh.id === warehouseId
    );
    if (selectedWarehouse) {
      setFormData({
        ...formData,
        warehouseId: selectedWarehouse.id,
        warehouseName: selectedWarehouse.name,
        warehouseAddress: selectedWarehouse.address
      });
    }
  };

  const handleTruckChange = (truckId: string) => {
    const selectedTruck = mockTrucks.find((truck) => truck.id === truckId);
    if (selectedTruck) {
      setSelectedTruckId(truckId);
      setFormData({
        ...formData,
        truckId: selectedTruck.id,
        truck: selectedTruck
      });

      // Validate with current orders
      if (selectedOrders.length > 0) {
        const validation = validateWeightCapacity(
          selectedOrders,
          selectedTruck
        );
        setValidation(validation);
      }
    }
  };

  const handleOrderSelection = (order: Order, isSelected: boolean) => {
    let newSelectedOrders: Order[];

    if (isSelected) {
      newSelectedOrders = [...selectedOrders, order];
    } else {
      newSelectedOrders = selectedOrders.filter((o) => o.id !== order.id);
    }

    setSelectedOrders(newSelectedOrders);

    // Calculate totals
    const totalWeight = newSelectedOrders.reduce(
      (sum, o) => sum + o.totalWeight,
      0
    );
    const totalVolume = newSelectedOrders.reduce(
      (sum, o) => sum + o.totalVolume,
      0
    );
    const totalValue = newSelectedOrders.reduce(
      (sum, o) => sum + o.totalValue,
      0
    );

    // Generate route from orders
    const route = newSelectedOrders.map((order) => ({
      orderId: order.id,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      estimatedArrival: order.deliveryDate,
      status: 'pending' as const
    }));

    setFormData({
      ...formData,
      orders: newSelectedOrders,
      totalWeight,
      totalVolume,
      totalValue,
      route
    });

    // Validate if truck is selected
    if (selectedTruckId) {
      const selectedTruck = mockTrucks.find((t) => t.id === selectedTruckId);
      if (selectedTruck) {
        const validation = validateWeightCapacity(
          newSelectedOrders,
          selectedTruck
        );
        setValidation(validation);
      }
    }
  };

  const handleCreate = () => {
    // Validation
    if (!selectedTruckId) {
      alert('Vui lòng chọn xe tải');
      return;
    }

    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    const selectedTruck = mockTrucks.find((t) => t.id === selectedTruckId);
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

    const newDelivery: OutboundDelivery = {
      ...(formData as OutboundDelivery),
      id: `OUT-2024-${(deliveries.length + 1).toString().padStart(3, '0')}`,
      truck: selectedTruck,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliveries([...deliveries, newDelivery]);
    setFormData({
      warehouseId: '',
      warehouseName: '',
      warehouseAddress: '',
      truckId: '',
      orders: [],
      totalWeight: 0,
      totalVolume: 0,
      totalValue: 0,
      departureTime: '',
      estimatedArrival: '',
      priorityLevel: 'medium',
      specialHandling: '',
      notes: ''
    });
    setSelectedOrders([]);
    setSelectedTruckId('');
    setValidation(null);
    setIsCreateDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconBuilding className='h-8 w-8 text-blue-600' />
            Vận chuyển Xuất kho (Outbound)
          </h1>
          <p className='text-muted-foreground'>
            Quản lý các đợt vận chuyển từ kho ra điểm phân phối
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <IconDownload className='mr-2 h-4 w-4' />
            Xuất báo cáo
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo đợt vận chuyển
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl'>
              <DialogHeader>
                <DialogTitle>Tạo đợt vận chuyển xuất kho mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết về đợt vận chuyển từ kho ra điểm phân
                  phối
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='warehouse'>Kho xuất</Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={handleWarehouseChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn kho xuất' />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseOptions.map((warehouse) => (
                        <SelectItem
                          key={warehouse.id}
                          value={warehouse.id}
                          label={warehouse.name}
                        >
                          <div className='text-muted-foreground text-sm'>
                            {warehouse.address}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='truck'>Chọn xe tải</Label>
                  <Select
                    value={selectedTruckId}
                    onValueChange={handleTruckChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn xe tải khả dụng' />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTrucks
                        .filter((truck) => truck.status === 'available')
                        .map((truck) => (
                          <SelectItem
                            key={truck.id}
                            value={truck.id}
                            label={`${truck.licenseNumber} - ${truck.model}`}
                          >
                            <div className='text-muted-foreground text-sm'>
                              Tải trọng: {truck.capacity}kg | Thể tích:{' '}
                              {truck.volume}m³
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTruckId && (
                  <Card className='bg-muted/20 mt-2'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm'>
                        Thông tin xe đã chọn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const selectedTruck = mockTrucks.find(
                          (t) => t.id === selectedTruckId
                        );
                        if (!selectedTruck) return null;
                        return (
                          <div className='grid gap-4 text-sm sm:grid-cols-2'>
                            <div className='flex items-center gap-2'>
                              <IconTruck className='h-4 w-4' />
                              <span className='font-medium'>Biển số:</span>
                              {selectedTruck.licenseNumber}
                            </div>
                            <div>
                              <span className='font-medium'>Model:</span>{' '}
                              {selectedTruck.model}
                            </div>
                            <div>
                              <span className='font-medium'>Tải trọng:</span>{' '}
                              {selectedTruck.capacity}kg
                            </div>
                            <div>
                              <span className='font-medium'>Thể tích:</span>{' '}
                              {selectedTruck.volume}m³
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                <div className='space-y-2'>
                  <Label>Chọn đơn hàng</Label>
                  <div className='max-h-40 overflow-y-auto rounded-lg border p-4'>
                    {mockOrders
                      .filter((order) => order.status === 'confirmed')
                      .map((order) => (
                        <div
                          key={order.id}
                          className='mb-2 flex items-center space-x-3 rounded border p-2'
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
                            <div className='font-medium'>
                              {order.customerName}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {order.items
                                .map((item) => item.productName)
                                .join(', ')}{' '}
                              - {order.totalWeight}kg
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='departureTime'>Thời gian khởi hành</Label>
                    <DateTimePicker
                      value={formData.departureTime}
                      onChange={(v: string) =>
                        setFormData({
                          ...formData,
                          departureTime: v
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='estimatedArrival'>Dự kiến giao hàng</Label>
                    <DateTimePicker
                      value={formData.estimatedArrival}
                      onChange={(v: string) =>
                        setFormData({
                          ...formData,
                          estimatedArrival: v
                        })
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='specialHandling'>Yêu cầu đặc biệt</Label>
                    <Input
                      id='specialHandling'
                      value={formData.specialHandling}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialHandling: e.target.value
                        })
                      }
                      placeholder='Ví dụ: Bảo quản lạnh -2°C'
                    />
                  </div>
                  <div className='flex items-center space-x-2 pt-6'>
                    <div className='text-muted-foreground text-sm'>
                      Chữ ký xác nhận sẽ được xử lý theo từng đơn hàng
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>Ghi chú</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder='Nhập ghi chú (tùy chọn)'
                    rows={3}
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate}>Tạo đợt vận chuyển</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng đợt</CardTitle>
            <IconActivity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{deliveries.length}</div>
            <p className='text-muted-foreground text-xs'>đợt vận chuyển</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang vận chuyển
            </CardTitle>
            <IconTruck className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {deliveries.filter((d) => d.status === 'in_transit').length}
            </div>
            <p className='text-muted-foreground text-xs'>đang trên đường</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đã giao</CardTitle>
            <IconPackage className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {deliveries.filter((d) => d.status === 'completed').length}
            </div>
            <p className='text-muted-foreground text-xs'>hoàn thành</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Khẩn cấp</CardTitle>
            <IconClock className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {deliveries.filter((d) => d.priorityLevel === 'urgent').length}
            </div>
            <p className='text-muted-foreground text-xs'>cần ưu tiên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang chất hàng
            </CardTitle>
            <IconActivity className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {deliveries.filter((d) => d.status === 'loading').length}
            </div>
            <p className='text-muted-foreground text-xs'>chuẩn bị</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
                <Input
                  placeholder='Tìm kiếm theo tên khách hàng, mã đơn, sản phẩm...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                <SelectItem value='scheduled'>Đã lên lịch</SelectItem>
                <SelectItem value='loading'>Đang chất hàng</SelectItem>
                <SelectItem value='in_transit'>Đang vận chuyển</SelectItem>
                <SelectItem value='departed'>Đã khởi hành</SelectItem>
                <SelectItem value='delivering'>Đang giao hàng</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
                <SelectItem value='returned'>Đã trả về</SelectItem>
                <SelectItem value='cancelled'>Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả mức độ</SelectItem>
                <SelectItem value='low'>Thấp</SelectItem>
                <SelectItem value='medium'>Trung bình</SelectItem>
                <SelectItem value='high'>Cao</SelectItem>
                <SelectItem value='urgent'>Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline'>
              <IconRefresh className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đợt vận chuyển xuất kho</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các đợt vận chuyển từ kho ra điểm phân phối
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đợt</TableHead>
                <TableHead>Kho xuất</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className='hover:bg-muted/50 cursor-pointer'
                  onClick={() =>
                    router.push(`/dashboard/delivery/outbound/${delivery.id}`)
                  }
                >
                  <TableCell className='font-medium'>{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {delivery.warehouseName}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {delivery.warehouseId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {delivery.orders.slice(0, 2).map((order) => (
                        <div key={order.id} className='mb-1'>
                          <div className='font-medium'>
                            {order.customerName}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            {order.items
                              .map((item) => item.productName)
                              .join(', ')}
                          </div>
                        </div>
                      ))}
                      {delivery.orders.length > 2 && (
                        <div className='text-muted-foreground text-xs'>
                          +{delivery.orders.length - 2} đơn nữa
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{delivery.orders.length} đơn hàng</div>
                      <div className='text-muted-foreground text-sm'>
                        {formatCurrency(delivery.totalValue)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.totalWeight}kg / {delivery.totalVolume}m³
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(delivery.priorityLevel)}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div>
                        Khởi hành: {formatDateTime(delivery.departureTime)}
                      </div>
                      <div className='text-muted-foreground'>
                        Dự kiến: {formatDateTime(delivery.estimatedArrival)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
