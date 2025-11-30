'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { fetchImportTickets } from '@/services/import-ticket.service';
import { fetchExportTickets } from '@/services/export-ticket.service';
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
  const [activities, setActivities] = useState<WarehouseActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Tất cả');
  const [selectedActivityType, setSelectedActivityType] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  useEffect(() => {
    const load = async () => {
      try {
        const [importsRes, exportsRes] = await Promise.all([
          fetchImportTickets({ page: 1, limit: 50 }),
          fetchExportTickets({ page: 1, limit: 50 })
        ]);

        const importActivities: WarehouseActivity[] = (
          importsRes.data ?? []
        ).map((it) => ({
          id: String(it.id),
          date: String(
            it.importDate ?? it.createdAt ?? new Date().toISOString()
          ),
          code: String(it.inboundBatch?.batchCode ?? it.id),
          type: 'import',
          productName: String(
            it.inboundBatch?.product?.name ??
              it?.inboundBatch?.harvestDetail?.product?.name ??
              '-'
          ),
          productCode: String(
            it?.inboundBatch?.harvestDetail?.product?.id ??
              it?.inboundBatch?.harvestDetail?.product?.id ??
              '-'
          ),
          quantity: Number(
            it.realityQuantity ?? it.inboundBatch?.harvestTicket?.quantity ?? 0
          ),
          unit: String(
            it.inboundBatch?.harvestTicket?.unit ?? it.inboundBatch?.unit ?? ''
          ),
          warehouse: String(
            it.inboundBatch?.harvestTicket?.harvestScheduleId?.supplierId
              ?.warehouse?.name ??
              it.area?.name ??
              '-'
          ),
          warehouseArea: it.area?.name ?? undefined,
          user: String(
            it.inboundBatch?.harvestTicket?.harvestScheduleId?.supplierId?.user
              ?.firstName &&
              it.inboundBatch?.harvestTicket?.harvestScheduleId?.supplierId
                ?.user?.lastName
              ? `${it.inboundBatch.harvestTicket.harvestScheduleId.supplierId.user.firstName} ${it.inboundBatch.harvestTicket.harvestScheduleId.supplierId.user.lastName}`
              : '-'
          ),
          notes: undefined,
          status: 'completed',
          batchNumber:
            it.numberOfBatch !== undefined && it.numberOfBatch !== null
              ? String(it.numberOfBatch)
              : undefined,
          supplier:
            it.inboundBatch?.harvestTicket?.harvestScheduleId?.supplierId
              ?.representativeName ?? undefined
        }));

        const exportActivities: WarehouseActivity[] = (
          exportsRes.data ?? []
        ).map((et) => ({
          id: String((et as any).id ?? ''),
          date: String(
            (et as any).ExportDate ??
              (et as any).createdAt ??
              new Date().toISOString()
          ),
          code: String(
            (et as any).orderDetail?.order?.id ?? (et as any).id ?? ''
          ),
          type: 'export',
          productName: String((et as any).orderDetail?.product?.name ?? '-'),
          productCode: String((et as any).orderDetail?.product?.id ?? '-'),
          quantity: Number((et as any).orderDetail?.quantity ?? 0),
          unit: String((et as any).orderDetail?.unit ?? ''),
          warehouse: '-',
          warehouseArea: undefined,
          user: String(
            (et as any).orderDetail?.order?.orderSchedule?.consignee
              ?.representativeName ?? '-'
          ),
          notes: undefined,
          status: 'completed',
          batchNumber:
            (et as any).numberOfBatch !== undefined &&
            (et as any).numberOfBatch !== null
              ? String((et as any).numberOfBatch)
              : undefined,
          customer:
            (et as any).orderDetail?.order?.orderSchedule?.consignee
              ?.organizationName ?? undefined
        }));

        setActivities([...importActivities, ...exportActivities]);
      } catch {}
    };
    load();
  }, []);

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
    setActivities((prev) => [...prev]);
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
