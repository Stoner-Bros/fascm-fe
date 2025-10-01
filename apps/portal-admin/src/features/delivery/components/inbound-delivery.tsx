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
import type { InboundDelivery, Truck } from '@/types/delivery';
import {
  IconClock,
  IconDownload,
  IconHome,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTruck
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock truck data
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

export function InboundDelivery() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<InboundDelivery[]>([
    {
      id: 'IN-2024-001',
      farmName: 'Vườn Organic A',
      farmAddress: 'Xã Tân Tiến, Huyện Văn Giang, Hưng Yên',
      farmContact: '0912345678',
      warehouseId: 'WH-001',
      warehouseName: 'Kho Trung tâm Hà Nội',
      warehouseAddress: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      truckId: 'TRUCK-001',
      truck: mockTrucks[0],
      productType: 'Rau lá tươi',
      quantity: 500,
      unit: 'kg',
      estimatedValue: 15000000,
      departureTime: '2024-09-18T05:00:00',
      estimatedArrival: '2024-09-18T09:00:00',
      actualArrival: '2024-09-18T09:15:00',
      status: 'completed',
      monitoring: {
        truckId: 'TRUCK-001',
        location: {
          latitude: 21.0285,
          longitude: 105.8542,
          address: 'Kho Trung tâm Hà Nội',
          timestamp: '2024-09-18T09:15:00'
        },
        environment: {
          temperature: 4.2,
          humidity: 65,
          timestamp: '2024-09-18T09:15:00'
        },
        speed: 0,
        fuel: 85,
        isMoving: false,
        lastUpdate: '2024-09-18T09:15:00'
      },
      notes:
        'Hàng hóa chất lượng tốt, đã kiểm tra kỹ. Xe vận chuyển với 2 nhân viên.',
      createdAt: '2024-09-17T10:00:00',
      updatedAt: '2024-09-18T09:30:00'
    },
    {
      id: 'IN-2024-002',
      farmName: 'Vườn Rau sạch B',
      farmAddress: 'Thôn Lại Da, Xã Kim Chung, Huyện Hoài Đức, Hà Nội',
      farmContact: '0923456789',
      warehouseId: 'WH-002',
      warehouseName: 'Kho Lạnh Thanh Xuân',
      warehouseAddress: 'Số 456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
      truckId: 'TRUCK-002',
      truck: mockTrucks[1],
      productType: 'Củ quả tươi',
      quantity: 300,
      unit: 'kg',
      estimatedValue: 8000000,
      departureTime: '2024-09-18T06:30:00',
      estimatedArrival: '2024-09-18T10:30:00',
      status: 'in_transit',
      monitoring: {
        truckId: 'TRUCK-002',
        location: {
          latitude: 21.1542,
          longitude: 105.7841,
          address: 'Đang trên đường Quốc lộ 32',
          timestamp: '2024-09-18T09:00:00'
        },
        environment: {
          temperature: 6.1,
          humidity: 70,
          timestamp: '2024-09-18T09:00:00'
        },
        speed: 45,
        fuel: 78,
        isMoving: true,
        lastUpdate: '2024-09-18T09:00:00'
      },
      notes: 'Đang trên đường về kho. Đội ngũ 2 nhân viên vận chuyển.',
      createdAt: '2024-09-17T14:00:00',
      updatedAt: '2024-09-18T08:45:00'
    },
    {
      id: 'IN-2024-003',
      farmName: 'Vườn Hữu cơ C',
      farmAddress: 'Xã Đông Mỹ, Huyện Thanh Trì, Hà Nội',
      farmContact: '0934567890',
      warehouseId: 'WH-003',
      warehouseName: 'Kho Nông sản Đông Anh',
      warehouseAddress: 'Khu Công nghiệp Đông Anh, Đông Anh, Hà Nội',
      truckId: 'TRUCK-001',
      truck: mockTrucks[0],
      productType: 'Hoa quả tươi',
      quantity: 200,
      unit: 'kg',
      estimatedValue: 12000000,
      departureTime: '2024-09-18T07:00:00',
      estimatedArrival: '2024-09-18T11:00:00',
      status: 'delayed',
      monitoring: {
        truckId: 'TRUCK-001',
        location: {
          latitude: 20.9842,
          longitude: 105.8461,
          address: 'Giao lộ Thanh Trì - Đông Anh',
          timestamp: '2024-09-18T10:30:00'
        },
        environment: {
          temperature: 8.5,
          humidity: 60,
          timestamp: '2024-09-18T10:30:00'
        },
        speed: 15,
        fuel: 72,
        isMoving: true,
        lastUpdate: '2024-09-18T10:30:00'
      },
      notes:
        'Gặp ùn tắc giao thông, dự kiến trễ 1 giờ. Xe có GPS và cảm biến theo dõi.',
      createdAt: '2024-09-17T16:30:00',
      updatedAt: '2024-09-18T09:00:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  // Form states
  const [formData, setFormData] = useState<
    Partial<InboundDelivery> & { harvestBatchId?: string }
  >({
    harvestBatchId: '',
    farmName: '',
    farmAddress: '',
    farmContact: '',
    warehouseId: '',
    warehouseName: '',
    warehouseAddress: '',
    truckId: '',
    productType: '',
    quantity: 0,
    unit: 'kg',
    estimatedValue: 0,
    departureTime: '',
    estimatedArrival: '',
    notes: ''
  });

  const getStatusBadge = (status: InboundDelivery['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className='border-gray-200 bg-gray-100 text-gray-700'>
            Đã lên lịch
          </Badge>
        );
      case 'departed':
        return (
          <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
            Đã khởi hành
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'arrived':
        return (
          <Badge className='border-orange-200 bg-orange-100 text-orange-700'>
            Đã đến kho
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Hoàn thành
          </Badge>
        );
      case 'delayed':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Chậm trễ
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

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      setFormData({
        ...formData,
        truckId: selectedTruck.id,
        truck: selectedTruck
      });
    }
  };

  const handleCreate = () => {
    const selectedTruck = mockTrucks.find(
      (truck) => truck.id === formData.truckId
    );
    if (!selectedTruck) {
      alert('Vui lòng chọn xe tải');
      return;
    }

    const newDelivery: InboundDelivery = {
      ...(formData as InboundDelivery),
      id: `IN-2024-${(deliveries.length + 1).toString().padStart(3, '0')}`,
      truck: selectedTruck,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliveries([...deliveries, newDelivery]);
    setFormData({
      harvestBatchId: '',
      farmName: '',
      farmAddress: '',
      farmContact: '',
      warehouseId: '',
      warehouseName: '',
      warehouseAddress: '',
      truckId: '',
      productType: '',
      quantity: 0,
      unit: 'kg',
      estimatedValue: 0,
      departureTime: '',
      estimatedArrival: '',
      notes: ''
    });
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
            <IconHome className='h-8 w-8 text-green-600' />
            Vận chuyển Nhập kho (Inbound)
          </h1>
          <p className='text-muted-foreground'>
            Quản lý các đợt vận chuyển từ vườn về kho
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <IconDownload className='mr-2 h-4 w-4' />
            Xuất báo cáo
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setFormData({
                  harvestBatchId: '',
                  farmName: '',
                  farmAddress: '',
                  farmContact: '',
                  warehouseId: '',
                  warehouseName: '',
                  warehouseAddress: '',
                  truckId: '',
                  productType: '',
                  quantity: 0,
                  unit: 'kg',
                  estimatedValue: 0,
                  departureTime: '',
                  estimatedArrival: '',
                  notes: ''
                });
              }
              setIsCreateDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo đợt vận chuyển
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl'>
              <DialogHeader>
                <DialogTitle>Tạo đợt vận chuyển nhập kho mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết về đợt vận chuyển từ vườn về kho
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='harvestBatch'>Mã thu hoạch</Label>
                  <Select
                    value={formData.harvestBatchId}
                    onValueChange={(value) => {
                      const selectedDelivery = deliveries.find(
                        (delivery) => delivery.id === value
                      );
                      if (selectedDelivery) {
                        setFormData({
                          ...formData,
                          harvestBatchId: value,
                          farmName: selectedDelivery.farmName,
                          farmAddress: selectedDelivery.farmAddress,
                          farmContact: selectedDelivery.farmContact,
                          warehouseId: selectedDelivery.warehouseId,
                          warehouseName: selectedDelivery.warehouseName,
                          warehouseAddress: selectedDelivery.warehouseAddress,
                          truckId: selectedDelivery.truckId,
                          truck: selectedDelivery.truck,
                          estimatedValue: selectedDelivery.estimatedValue,
                          productType: selectedDelivery.productType,
                          quantity: selectedDelivery.quantity,
                          unit: selectedDelivery.unit
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn mã thu hoạch' />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveries.map((delivery) => (
                        <SelectItem key={delivery.id} value={delivery.id}>
                          {delivery.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='farmName'>Tên vườn</Label>
                    <Input
                      id='farmName'
                      value={formData.farmName}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='farmContact'>SĐT liên hệ vườn</Label>
                    <Input
                      id='farmContact'
                      value={formData.farmContact}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='farmAddress'>Địa chỉ vườn</Label>
                  <Textarea
                    id='farmAddress'
                    value={formData.farmAddress}
                    disabled
                    readOnly
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='warehouse'>Kho đích</Label>
                  <Input
                    id='warehouseName'
                    value={formData.warehouseName}
                    disabled
                    readOnly
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='truck'>Xe tải</Label>
                  <Input
                    id='truckId'
                    value={
                      formData.truck
                        ? `${formData.truck.licenseNumber} - ${formData.truck.model}`
                        : ''
                    }
                    disabled
                    readOnly
                  />
                </div>

                <div className='grid grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='productType'>Loại sản phẩm</Label>
                    <Input
                      id='productType'
                      value={formData.productType}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Số lượng</Label>
                    <Input
                      id='quantity'
                      type='number'
                      value={formData.quantity}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='unit'>Đơn vị</Label>
                    <Input id='unit' value={formData.unit} disabled readOnly />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='unit'>Đơn giá</Label>
                    <Input
                      id='estimatedValue'
                      value={formData.estimatedValue}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
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
                    <Label htmlFor='estimatedArrival'>Dự kiến đến kho</Label>
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
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng đợt</CardTitle>
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
            <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {deliveries.filter((d) => d.status === 'completed').length}
            </div>
            <p className='text-muted-foreground text-xs'>đã nhập kho</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Chậm trễ</CardTitle>
            <IconClock className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {deliveries.filter((d) => d.status === 'delayed').length}
            </div>
            <p className='text-muted-foreground text-xs'>cần xử lý</p>
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
                  placeholder='Tìm kiếm theo tên vườn, mã đơn, sản phẩm...'
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
                <SelectItem value='departed'>Đã khởi hành</SelectItem>
                <SelectItem value='in_transit'>Đang vận chuyển</SelectItem>
                <SelectItem value='arrived'>Đã đến kho</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
                <SelectItem value='delayed'>Chậm trễ</SelectItem>
                <SelectItem value='cancelled'>Đã hủy</SelectItem>
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
          <CardTitle>Danh sách đợt vận chuyển</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các đợt vận chuyển nhập kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đợt</TableHead>
                <TableHead>Vườn</TableHead>
                <TableHead>Kho đích</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
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
                    router.push(`/dashboard/delivery/inbound/${delivery.id}`)
                  }
                >
                  <TableCell className='font-medium'>{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{delivery.farmName}</div>
                      <div className='text-muted-foreground text-sm'>
                        {delivery.farmContact}
                      </div>
                    </div>
                  </TableCell>
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
                  {/* Removed Truck & Staff column */}
                  <TableCell>
                    <div>
                      <div>{delivery.productType}</div>
                      <div className='text-muted-foreground text-sm'>
                        {formatCurrency(delivery.estimatedValue)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.quantity} {delivery.unit}
                  </TableCell>
                  {/* Removed Monitoring column */}
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
