'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
import {
  IconSearch,
  IconFilter,
  IconArrowDown,
  IconArrowUp,
  IconPackage,
  IconCalendar,
  IconUser,
  IconMapPin,
  IconFileText,
  IconRefresh
} from '@tabler/icons-react';

// Define types for warehouse activities
export interface WarehouseActivity {
  id: string;
  date: string;
  code: string;
  type: 'import' | 'export';
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  warehouse: string;
  warehouseArea?: string;
  user: string;
  notes?: string;
  status:
    | 'pending_assignment'
    | 'assigned'
    | 'delivering'
    | 'completed'
    | 'cancelled';
  batchNumber?: string;
  supplier?: string;
  customer?: string;
  deliveryStaff?: string;
  assignedAt?: string;
  deliveryStartedAt?: string;
  completedAt?: string;
}

// Mock data for warehouse activities
const mockActivities: WarehouseActivity[] = [
  {
    id: '1',
    date: '2025-10-30T08:00:00',
    code: 'PXK-20251030-01',
    type: 'export',
    productName: 'Gạo ST25',
    productCode: 'RICE-ST25-001',
    quantity: 200,
    unit: 'Kg',
    warehouse: 'Kho chính',
    warehouseArea: 'Khu A1',
    user: 'Nguyễn Văn A',
    notes: 'Giao hàng đơn #1234',
    status: 'completed',
    customer: 'Siêu thị BigC',
    deliveryStaff: 'Lê Văn Giao',
    assignedAt: '2025-10-30T08:15:00',
    deliveryStartedAt: '2025-10-30T09:00:00',
    completedAt: '2025-10-30T11:30:00'
  },
  {
    id: '2',
    date: '2025-10-29T14:30:00',
    code: 'PNK-20251029-03',
    type: 'import',
    productName: 'Đường trắng',
    productCode: 'SUGAR-WHITE-002',
    quantity: 100,
    unit: 'Kg',
    warehouse: 'Kho lẻ',
    warehouseArea: 'Khu B2',
    user: 'Trần Thị B',
    notes: 'Nhập hàng từ NCC #567',
    status: 'completed',
    supplier: 'Công ty TNHH ABC',
    batchNumber: 'BATCH-2025-001',
    deliveryStaff: 'Phạm Văn Nhận',
    assignedAt: '2025-10-29T14:45:00',
    deliveryStartedAt: '2025-10-29T15:00:00',
    completedAt: '2025-10-29T16:15:00'
  },
  {
    id: '3',
    date: '2025-10-29T10:15:00',
    code: 'PXK-20251029-02',
    type: 'export',
    productName: 'Nước mắm',
    productCode: 'SAUCE-FM-003',
    quantity: 50,
    unit: 'Chai',
    warehouse: 'Kho chính',
    warehouseArea: 'Khu C1',
    user: 'Lê Văn C',
    notes: 'Xuất cho nhà hàng',
    status: 'delivering',
    customer: 'Nhà hàng Hải Sản',
    deliveryStaff: 'Nguyễn Thị Giao',
    assignedAt: '2025-10-29T10:30:00',
    deliveryStartedAt: '2025-10-29T11:00:00'
  },
  {
    id: '4',
    date: '2025-10-28T16:45:00',
    code: 'PNK-20251028-01',
    type: 'import',
    productName: 'Thịt bò tươi',
    productCode: 'MEAT-BEEF-004',
    quantity: 75,
    unit: 'Kg',
    warehouse: 'Kho lạnh',
    warehouseArea: 'Khu D1',
    user: 'Phạm Thị D',
    notes: 'Nhập hàng tươi sống',
    status: 'assigned',
    supplier: 'Trang trại XYZ',
    batchNumber: 'FRESH-2025-028',
    deliveryStaff: 'Trần Văn Vận',
    assignedAt: '2025-10-28T17:00:00'
  },
  {
    id: '5',
    date: '2025-10-28T09:20:00',
    code: 'PXK-20251028-01',
    type: 'export',
    productName: 'Rau cải xanh',
    productCode: 'VEG-CABBAGE-005',
    quantity: 30,
    unit: 'Kg',
    warehouse: 'Kho tươi sống',
    warehouseArea: 'Khu E1',
    user: 'Hoàng Văn E',
    notes: 'Xuất cho siêu thị',
    status: 'pending_assignment',
    customer: 'Siêu thị Lotte'
  },
  {
    id: '6',
    date: '2025-10-27T13:10:00',
    code: 'PNK-20251027-02',
    type: 'import',
    productName: 'Bánh mì tươi',
    productCode: 'BREAD-FRESH-006',
    quantity: 120,
    unit: 'Ổ',
    warehouse: 'Kho bánh kẹo',
    warehouseArea: 'Khu F1',
    user: 'Vũ Thị F',
    notes: 'Nhập từ lò bánh',
    status: 'cancelled',
    supplier: 'Lò bánh Như Lan',
    batchNumber: 'BREAD-2025-027'
  },
  {
    id: '7',
    date: '2025-10-30T15:20:00',
    code: 'PXK-20251030-02',
    type: 'export',
    productName: 'Sữa tươi',
    productCode: 'MILK-FRESH-007',
    quantity: 80,
    unit: 'Hộp',
    warehouse: 'Kho lạnh',
    warehouseArea: 'Khu D2',
    user: 'Đỗ Văn G',
    notes: 'Giao cho cửa hàng tiện lợi',
    status: 'assigned',
    customer: 'Circle K',
    deliveryStaff: 'Bùi Thị Hoa',
    assignedAt: '2025-10-30T15:35:00'
  }
];

const warehouses = [
  'Tất cả',
  'Kho chính',
  'Kho lẻ',
  'Kho lạnh',
  'Kho tươi sống',
  'Kho bánh kẹo'
];
const activityTypes = ['Tất cả', 'Xuất kho', 'Nhập kho'];
export function WarehouseActivitiesTable() {
  const [activities] = useState<WarehouseActivity[]>(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Tất cả');
  const [selectedActivityType, setSelectedActivityType] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.notes &&
          activity.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse =
        selectedWarehouse === 'Tất cả' ||
        activity.warehouse === selectedWarehouse;

      const matchesActivityType =
        selectedActivityType === 'Tất cả' ||
        (selectedActivityType === 'Xuất kho' && activity.type === 'export') ||
        (selectedActivityType === 'Nhập kho' && activity.type === 'import');

      const matchesStatus =
        selectedStatus === 'Tất cả' ||
        (selectedStatus === 'Hoàn thành' && activity.status === 'completed') ||
        (selectedStatus === 'Đang xử lý' &&
          (activity.status === 'pending_assignment' ||
            activity.status === 'assigned' ||
            activity.status === 'delivering')) ||
        (selectedStatus === 'Đã hủy' && activity.status === 'cancelled');

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesActivityType &&
        matchesStatus
      );
    });
  }, [
    activities,
    searchTerm,
    selectedWarehouse,
    selectedActivityType,
    selectedStatus
  ]);

  const getActivityTypeIcon = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <IconArrowDown className='h-4 w-4 text-green-600' />
    ) : (
      <IconArrowUp className='h-4 w-4 text-blue-600' />
    );
  };

  const getActivityTypeBadge = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <Badge variant='secondary' className='bg-green-100 text-green-800'>
        Nhập kho
      </Badge>
    ) : (
      <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
        Xuất kho
      </Badge>
    );
  };

  const getStatusBadge = (status: WarehouseActivity['status']) => {
    const statusConfig = {
      pending_assignment: {
        label: 'Chờ phân công',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      assigned: {
        label: 'Đã phân công',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      delivering: {
        label: 'Đang giao hàng',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      completed: {
        label: 'Hoàn tất',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status];
    return (
      <span
        className={`rounded-full border px-2 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedWarehouse('Tất cả');
    setSelectedActivityType('Tất cả');
    setSelectedStatus('Tất cả');
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <IconPackage className='h-5 w-5' />
              Hoạt động xuất nhập kho gần đây
            </CardTitle>
            <CardDescription>
              Theo dõi tất cả các hoạt động xuất nhập kho trong hệ thống
            </CardDescription>
          </div>
          <Button variant='outline' size='sm' onClick={clearFilters}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className='mb-6 space-y-4'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='min-w-[200px] flex-1'>
              <div className='relative'>
                <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder='Tìm kiếm sản phẩm, mã phiếu, người thực hiện...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex items-center gap-2'>
              <IconFilter className='h-4 w-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-700'>Bộ lọc:</span>
            </div>

            <Select
              value={selectedActivityType}
              onValueChange={setSelectedActivityType}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Loại hoạt động' />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Kho hàng' />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Tất cả trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Tất cả'>Tất cả trạng thái</SelectItem>
                <SelectItem value='pending_assignment'>
                  Chờ phân công
                </SelectItem>
                <SelectItem value='assigned'>Đã phân công</SelectItem>
                <SelectItem value='delivering'>Đang giao hàng</SelectItem>
                <SelectItem value='completed'>Hoàn tất</SelectItem>
                <SelectItem value='cancelled'> Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className='mb-4 text-sm text-gray-600'>
          Hiển thị {filteredActivities.length} kết quả từ tổng số{' '}
          {activities.length} hoạt động
        </div>

        {/* Activities Table */}
        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Ngày</TableHead>
                <TableHead className='font-semibold'>Mã phiếu</TableHead>
                <TableHead className='font-semibold'>Loại hoạt động</TableHead>
                <TableHead className='font-semibold'>Sản phẩm</TableHead>
                <TableHead className='font-semibold'>Số lượng</TableHead>
                <TableHead className='font-semibold'>Đơn vị</TableHead>
                <TableHead className='font-semibold'>Kho</TableHead>
                <TableHead className='font-semibold'>Người thực hiện</TableHead>
                <TableHead className='font-semibold'>
                  Nhân viên giao hàng
                </TableHead>
                <TableHead className='font-semibold'>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className='py-8 text-center text-gray-500'
                  >
                    Không tìm thấy hoạt động nào phù hợp với bộ lọc
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id} className='hover:bg-gray-50'>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconCalendar className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          {format(new Date(activity.date), 'dd/MM/yyyy', {
                            locale: vi
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className='rounded bg-gray-100 px-2 py-1 text-xs'>
                        {activity.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getActivityTypeIcon(activity.type)}
                        {getActivityTypeBadge(activity.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='text-sm font-medium'>
                          {activity.productName}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {activity.productCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {activity.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell>{activity.unit}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconMapPin className='h-4 w-4 text-gray-400' />
                        <div>
                          <div className='text-sm font-medium'>
                            {activity.warehouse}
                          </div>
                          {activity.warehouseArea && (
                            <div className='text-xs text-gray-500'>
                              {activity.warehouseArea}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconUser className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>{activity.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.deliveryStaff ? (
                        <div className='flex items-center gap-2'>
                          <IconUser className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            {activity.deliveryStaff}
                          </span>
                        </div>
                      ) : (
                        <span className='text-sm text-gray-400'>-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
