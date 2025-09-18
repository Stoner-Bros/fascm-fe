'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconHome,
  IconPlus,
  IconTruck,
  IconClock,
  IconRefresh,
  IconSearch,
  IconDownload,
  IconActivity
} from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InboundDelivery {
  id: string;
  farmName: string;
  farmAddress: string;
  farmContact: string;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  productType: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'in_transit'
    | 'arrived'
    | 'completed'
    | 'cancelled'
    | 'delayed';
  temperature?: number;
  humidity?: number;
  gpsLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
      driverName: 'Nguyễn Văn A',
      driverPhone: '0987654321',
      vehicleNumber: 'HY-29A-12345',
      productType: 'Rau lá tươi',
      quantity: 500,
      unit: 'kg',
      estimatedValue: 15000000,
      departureTime: '2024-09-18T05:00:00',
      estimatedArrival: '2024-09-18T09:00:00',
      actualArrival: '2024-09-18T09:15:00',
      status: 'completed',
      temperature: 4.2,
      humidity: 65,
      gpsLocation: '21.0285, 105.8542',
      notes: 'Hàng hóa chất lượng tốt, đã kiểm tra kỹ',
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
      driverName: 'Trần Văn B',
      driverPhone: '0976543210',
      vehicleNumber: 'HN-30B-67890',
      productType: 'Củ quả tươi',
      quantity: 300,
      unit: 'kg',
      estimatedValue: 8000000,
      departureTime: '2024-09-18T06:30:00',
      estimatedArrival: '2024-09-18T10:30:00',
      status: 'in_transit',
      temperature: 6.1,
      humidity: 70,
      gpsLocation: '21.1542, 105.7841',
      notes: 'Đang trên đường về kho',
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
      driverName: 'Lê Văn C',
      driverPhone: '0965432109',
      vehicleNumber: 'HN-31C-11111',
      productType: 'Hoa quả tươi',
      quantity: 200,
      unit: 'kg',
      estimatedValue: 12000000,
      departureTime: '2024-09-18T07:00:00',
      estimatedArrival: '2024-09-18T11:00:00',
      status: 'delayed',
      temperature: 8.5,
      humidity: 60,
      gpsLocation: '20.9842, 105.8461',
      notes: 'Gặp ùn tắc giao thông, dự kiến trễ 1 giờ',
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
  const [formData, setFormData] = useState<Partial<InboundDelivery>>({
    farmName: '',
    farmAddress: '',
    farmContact: '',
    warehouseId: '',
    warehouseName: '',
    warehouseAddress: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
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

  const handleCreate = () => {
    const newDelivery: InboundDelivery = {
      ...(formData as InboundDelivery),
      id: `IN-2024-${(deliveries.length + 1).toString().padStart(3, '0')}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliveries([...deliveries, newDelivery]);
    setFormData({
      farmName: '',
      farmAddress: '',
      farmContact: '',
      warehouseId: '',
      warehouseName: '',
      warehouseAddress: '',
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
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
                <DialogTitle>Tạo đợt vận chuyển nhập kho mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết về đợt vận chuyển từ vườn về kho
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='farmName'>Tên vườn</Label>
                    <Input
                      id='farmName'
                      value={formData.farmName}
                      onChange={(e) =>
                        setFormData({ ...formData, farmName: e.target.value })
                      }
                      placeholder='Nhập tên vườn'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='farmContact'>SĐT liên hệ vườn</Label>
                    <Input
                      id='farmContact'
                      value={formData.farmContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          farmContact: e.target.value
                        })
                      }
                      placeholder='Nhập số điện thoại'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='farmAddress'>Địa chỉ vườn</Label>
                  <Textarea
                    id='farmAddress'
                    value={formData.farmAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, farmAddress: e.target.value })
                    }
                    placeholder='Nhập địa chỉ đầy đủ'
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='warehouse'>Kho đích</Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={handleWarehouseChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn kho đích' />
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
                    <Label htmlFor='estimatedValue'>
                      Giá trị ước tính (VND)
                    </Label>
                    <Input
                      id='estimatedValue'
                      type='number'
                      value={formData.estimatedValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedValue: Number(e.target.value)
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
                    <Label htmlFor='estimatedArrival'>Dự kiến đến kho</Label>
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
            <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
            <IconActivity className='h-4 w-4 text-green-600' />
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
