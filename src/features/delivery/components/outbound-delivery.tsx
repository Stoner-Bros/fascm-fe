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
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OutboundDelivery {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerType: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  productType: string;
  quantity: number;
  unit: string;
  totalValue: number;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'loading'
    | 'in_transit'
    | 'arrived'
    | 'delivered'
    | 'returned'
    | 'cancelled';
  temperature?: number;
  humidity?: number;
  gpsLocation?: string;
  notes?: string;
  priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
  requiresSignature: boolean;
  specialHandling?: string;
  createdAt: string;
  updatedAt: string;
}

export function OutboundDelivery() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([
    {
      id: 'OUT-2024-001',
      warehouseId: 'WH-001',
      warehouseName: 'Kho Trung tâm Hà Nội',
      warehouseAddress: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      customerName: 'Siêu thị BigC',
      customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      customerContact: '0281234567',
      customerType: 'supermarket',
      driverName: 'Phạm Văn D',
      driverPhone: '0912345678',
      vehicleNumber: 'SG-51A-12345',
      productType: 'Rau lá tươi',
      quantity: 800,
      unit: 'kg',
      totalValue: 24000000,
      departureTime: '2024-09-18T06:00:00',
      estimatedArrival: '2024-09-18T14:00:00',
      actualArrival: '2024-09-18T13:45:00',
      status: 'delivered',
      temperature: 4.5,
      humidity: 65,
      gpsLocation: '10.7769, 106.7009',
      notes: 'Giao hàng thành công, đã có chữ ký xác nhận',
      priorityLevel: 'high',
      requiresSignature: true,
      specialHandling: 'Bảo quản lạnh',
      createdAt: '2024-09-17T08:00:00',
      updatedAt: '2024-09-18T14:00:00'
    },
    {
      id: 'OUT-2024-002',
      warehouseId: 'WH-002',
      warehouseName: 'Kho Lạnh Thanh Xuân',
      warehouseAddress: 'Số 456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerName: 'Nhà hàng Hải Sản Tươi',
      customerAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
      customerContact: '0287654321',
      customerType: 'restaurant',
      driverName: 'Nguyễn Văn E',
      driverPhone: '0923456789',
      vehicleNumber: 'SG-52B-67890',
      productType: 'Hải sản đông lạnh',
      quantity: 200,
      unit: 'kg',
      totalValue: 18000000,
      departureTime: '2024-09-18T07:30:00',
      estimatedArrival: '2024-09-18T11:30:00',
      status: 'in_transit',
      temperature: -1.8,
      humidity: 45,
      gpsLocation: '10.7829, 106.6831',
      notes: 'Đang trên đường giao, nhiệt độ ổn định',
      priorityLevel: 'urgent',
      requiresSignature: true,
      specialHandling: 'Đông lạnh -2°C',
      createdAt: '2024-09-17T15:00:00',
      updatedAt: '2024-09-18T09:00:00'
    },
    {
      id: 'OUT-2024-003',
      warehouseId: 'WH-003',
      warehouseName: 'Kho Nông sản Đông Anh',
      warehouseAddress: 'Khu Công nghiệp Đông Anh, Đông Anh, Hà Nội',
      customerName: 'Kho bãi Miền Tây',
      customerAddress: '789 Quốc lộ 1A, Cần Thơ',
      customerContact: '0292345678',
      customerType: 'distributor',
      driverName: 'Trần Văn F',
      driverPhone: '0934567890',
      vehicleNumber: 'CT-60C-11111',
      productType: 'Thực phẩm khô',
      quantity: 1200,
      unit: 'kg',
      totalValue: 15000000,
      departureTime: '2024-09-18T05:00:00',
      estimatedArrival: '2024-09-18T12:00:00',
      status: 'loading',
      priorityLevel: 'medium',
      requiresSignature: false,
      notes: 'Đang tiến hành đóng gói và chất hàng',
      createdAt: '2024-09-17T12:00:00',
      updatedAt: '2024-09-18T05:30:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
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
  const [formData, setFormData] = useState<Partial<OutboundDelivery>>({
    warehouseId: '',
    warehouseName: '',
    warehouseAddress: '',
    customerName: '',
    customerAddress: '',
    customerContact: '',
    customerType: 'supermarket',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    productType: '',
    quantity: 0,
    unit: 'kg',
    totalValue: 0,
    departureTime: '',
    estimatedArrival: '',
    priorityLevel: 'medium',
    requiresSignature: true,
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
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'arrived':
        return (
          <Badge className='border-orange-200 bg-orange-100 text-orange-700'>
            Đã đến nơi
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Đã giao
          </Badge>
        );
      case 'returned':
        return (
          <Badge className='border-purple-200 bg-purple-100 text-purple-700'>
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

  const getCustomerTypeLabel = (type: OutboundDelivery['customerType']) => {
    switch (type) {
      case 'supermarket':
        return 'Siêu thị';
      case 'restaurant':
        return 'Nhà hàng';
      case 'distributor':
        return 'Nhà phân phối';
      case 'retailer':
        return 'Cửa hàng bán lẻ';
      default:
        return type;
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.productType.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleCreate = () => {
    const newDelivery: OutboundDelivery = {
      ...(formData as OutboundDelivery),
      id: `OUT-2024-${(deliveries.length + 1).toString().padStart(3, '0')}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliveries([...deliveries, newDelivery]);
    setFormData({
      warehouseId: '',
      warehouseName: '',
      warehouseAddress: '',
      customerName: '',
      customerAddress: '',
      customerContact: '',
      customerType: 'supermarket',
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
      productType: '',
      quantity: 0,
      unit: 'kg',
      totalValue: 0,
      departureTime: '',
      estimatedArrival: '',
      priorityLevel: 'medium',
      requiresSignature: true,
      specialHandling: '',
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
            <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
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
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          <div>
                            <div className='font-medium'>{warehouse.name}</div>
                            <div className='text-muted-foreground text-sm'>
                              {warehouse.address}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='customerName'>Tên khách hàng</Label>
                    <Input
                      id='customerName'
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerName: e.target.value
                        })
                      }
                      placeholder='Nhập tên khách hàng'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='customerType'>Loại khách hàng</Label>
                    <Select
                      value={formData.customerType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          customerType:
                            value as OutboundDelivery['customerType']
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='supermarket'>Siêu thị</SelectItem>
                        <SelectItem value='restaurant'>Nhà hàng</SelectItem>
                        <SelectItem value='distributor'>
                          Nhà phân phối
                        </SelectItem>
                        <SelectItem value='retailer'>
                          Cửa hàng bán lẻ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='customerContact'>SĐT khách hàng</Label>
                    <Input
                      id='customerContact'
                      value={formData.customerContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerContact: e.target.value
                        })
                      }
                      placeholder='Nhập số điện thoại'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='priorityLevel'>Mức độ ưu tiên</Label>
                    <Select
                      value={formData.priorityLevel}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          priorityLevel:
                            value as OutboundDelivery['priorityLevel']
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='low'>Thấp</SelectItem>
                        <SelectItem value='medium'>Trung bình</SelectItem>
                        <SelectItem value='high'>Cao</SelectItem>
                        <SelectItem value='urgent'>Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='customerAddress'>Địa chỉ giao hàng</Label>
                  <Textarea
                    id='customerAddress'
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerAddress: e.target.value
                      })
                    }
                    placeholder='Nhập địa chỉ đầy đủ'
                    rows={2}
                  />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='driverName'>Tên tài xế</Label>
                    <Input
                      id='driverName'
                      value={formData.driverName}
                      onChange={(e) =>
                        setFormData({ ...formData, driverName: e.target.value })
                      }
                      placeholder='Nhập tên tài xế'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='driverPhone'>SĐT tài xế</Label>
                    <Input
                      id='driverPhone'
                      value={formData.driverPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          driverPhone: e.target.value
                        })
                      }
                      placeholder='Nhập SĐT'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='vehicleNumber'>Biển số xe</Label>
                    <Input
                      id='vehicleNumber'
                      value={formData.vehicleNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleNumber: e.target.value
                        })
                      }
                      placeholder='Nhập biển số'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='productType'>Loại sản phẩm</Label>
                    <Input
                      id='productType'
                      value={formData.productType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productType: e.target.value
                        })
                      }
                      placeholder='Ví dụ: Rau lá tươi'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Số lượng</Label>
                    <Input
                      id='quantity'
                      type='number'
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Number(e.target.value)
                        })
                      }
                      placeholder='Nhập số lượng'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='unit'>Đơn vị</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='kg'>Kilogram (kg)</SelectItem>
                        <SelectItem value='tấn'>Tấn</SelectItem>
                        <SelectItem value='thùng'>Thùng</SelectItem>
                        <SelectItem value='bao'>Bao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='totalValue'>Tổng giá trị (VND)</Label>
                    <Input
                      id='totalValue'
                      type='number'
                      value={formData.totalValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalValue: Number(e.target.value)
                        })
                      }
                      placeholder='Nhập giá trị'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='departureTime'>Thời gian khởi hành</Label>
                    <Input
                      id='departureTime'
                      type='datetime-local'
                      value={formData.departureTime?.substring(0, 16)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departureTime: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='estimatedArrival'>Dự kiến giao hàng</Label>
                    <Input
                      id='estimatedArrival'
                      type='datetime-local'
                      value={formData.estimatedArrival?.substring(0, 16)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedArrival: e.target.value
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
                    <input
                      type='checkbox'
                      id='requiresSignature'
                      checked={formData.requiresSignature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiresSignature: e.target.checked
                        })
                      }
                      className='rounded'
                    />
                    <Label htmlFor='requiresSignature'>
                      Yêu cầu chữ ký xác nhận
                    </Label>
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
              {deliveries.filter((d) => d.status === 'delivered').length}
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
                <SelectItem value='arrived'>Đã đến nơi</SelectItem>
                <SelectItem value='delivered'>Đã giao</SelectItem>
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
                      <div className='font-medium'>{delivery.customerName}</div>
                      <div className='text-muted-foreground text-sm'>
                        {getCustomerTypeLabel(delivery.customerType)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{delivery.productType}</div>
                      <div className='text-muted-foreground text-sm'>
                        {formatCurrency(delivery.totalValue)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.quantity} {delivery.unit}
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
