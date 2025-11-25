'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  IconBuilding,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconTruck
} from '@tabler/icons-react';
import {
  createWarehouse,
  fetchWarehouses,
  deleteWarehouse
} from '@/services/warehouse.service';
import { createManager, fetchManagers } from '@/services/manager.service';
import { fetchStaffs } from '@/services/staff.service';
import { fetchDeliveryStaffs } from '@/services/delivery-staff.service';
import type { Warehouse } from '@/types/warehouse';
import type { Manager } from '@/types/manager';
import type { Staff } from '@/types/staff';
import type { DeliveryStaff } from '@/types/delivery-staff';

export function WarehouseManagement() {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [allManagers, setAllManagers] = useState<Manager[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [deliveryStaffs, setDeliveryStaffs] = useState<DeliveryStaff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [form, setForm] = useState({
    name: '',
    address: '',
    managerId: ''
  });

  const loadWarehouses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWarehouses({
        page: 1,
        limit: 50,
        search: filters.search || undefined
      });
      setWarehouses(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách warehouse',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const allManagersList: Manager[] = [];
      for (const warehouse of warehouses) {
        const res = await fetchManagers({
          page: 1,
          limit: 10,
          warehouseId: warehouse.id
        });
        allManagersList.push(...res.data);
      }
      setManagers(allManagersList);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const loadAllManagers = async () => {
    setIsLoadingManagers(true);
    try {
      const res = await fetchManagers({
        page: 1,
        limit: 100
      });
      setAllManagers(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách managers',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const loadStaffs = async () => {
    try {
      const allStaffs: Staff[] = [];
      for (const warehouse of warehouses) {
        const res = await fetchStaffs({
          page: 1,
          limit: 100,
          warehouseId: warehouse.id
        });
        allStaffs.push(...res.data);
      }
      setStaffs(allStaffs);
    } catch (error) {
      console.error('Error loading staffs:', error);
    }
  };

  const loadDeliveryStaffs = async () => {
    try {
      const allDeliveryStaffs: DeliveryStaff[] = [];
      for (const warehouse of warehouses) {
        const res = await fetchDeliveryStaffs({
          page: 1,
          limit: 100,
          warehouseId: warehouse.id
        });
        allDeliveryStaffs.push(...res.data);
      }
      setDeliveryStaffs(allDeliveryStaffs);
    } catch (error) {
      console.error('Error loading delivery staffs:', error);
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadAllManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (warehouses.length > 0) {
      loadManagers();
      loadStaffs();
      loadDeliveryStaffs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouses]);

  // Get managers without warehouse
  const availableManagers = allManagers.filter(
    (manager) => !manager.warehouse?.id
  );

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      managerId: ''
    });
  };

  const handleCreate = async () => {
    if (!form.name || !form.address) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin warehouse'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create warehouse first
      const newWarehouse = await createWarehouse({
        name: form.name,
        address: form.address
      });

      // Step 2: If managerId is provided, create manager with warehouseId
      if (form.managerId) {
        const selectedManager = allManagers.find(
          (m) => m.id === form.managerId
        );
        if (!selectedManager?.user?.id) {
          toast({
            variant: 'destructive',
            title: 'Manager không hợp lệ'
          });
          return;
        }
        try {
          await createManager({
            warehouse: { id: newWarehouse.id },
            user: { id: selectedManager.user.id }
          });
          toast({
            title: 'Đã tạo warehouse và manager',
            description: `Warehouse ${newWarehouse.name} đã được tạo với manager`
          });
        } catch (managerError) {
          // Warehouse created but manager failed - still show success for warehouse
          toast({
            variant: 'destructive',
            title: 'Warehouse đã tạo nhưng không thể tạo manager',
            description:
              managerError instanceof Error
                ? managerError.message
                : 'Vui lòng thử lại'
          });
        }
      } else {
        toast({
          title: 'Đã tạo warehouse',
          description: `Warehouse ${newWarehouse.name} đã được tạo`
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
      await loadWarehouses();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo warehouse',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getManagerForWarehouse = (warehouseId: string) => {
    return managers.find((m) => m.warehouse?.id === warehouseId);
  };

  const getStaffsForWarehouse = (warehouseId: string) => {
    return staffs.filter((s) => s.warehouse?.id === warehouseId);
  };

  const getDeliveryStaffsForWarehouse = (warehouseId: string) => {
    return deliveryStaffs.filter((ds) => ds.warehouse?.id === warehouseId);
  };

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconBuilding className='h-8 w-8 text-blue-600' />
            Quản lý Warehouse
          </h1>
          <p className='text-muted-foreground'>
            Tạo và quản lý các kho hàng, manager, staff và delivery staff
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={loadWarehouses}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetForm();
              }
              setIsCreateDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Tạo warehouse</DialogTitle>
                <DialogDescription>
                  Tạo warehouse mới. Có thể gắn manager ngay khi tạo (tùy chọn).
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Tên warehouse *</Label>
                  <Input
                    id='name'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder='VD: Kho Trung tâm Hà Nội'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='address'>Địa chỉ *</Label>
                  <Input
                    id='address'
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder='VD: Số 123 Đường ABC, Quận XYZ, Hà Nội'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='managerId'>Manager (tùy chọn)</Label>
                  <Select
                    value={form.managerId}
                    onValueChange={(value) =>
                      setForm({ ...form, managerId: value })
                    }
                    disabled={isLoadingManagers}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingManagers
                            ? 'Đang tải...'
                            : availableManagers.length === 0
                              ? 'Không có manager trống'
                              : 'Chọn manager chưa có warehouse'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.user?.firstName || manager.user?.lastName
                            ? `${manager.user.firstName || ''} ${manager.user.lastName || ''}`.trim()
                            : manager.user?.id || manager.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-muted-foreground text-xs'>
                    Chỉ hiển thị các manager chưa có warehouse. 1 manager chỉ
                    được 1 warehouse.
                  </p>
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo warehouse'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-wrap gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo tên, địa chỉ warehouse...'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className='pl-10'
              />
            </div>
            <Button variant='outline' onClick={loadWarehouses}>
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách warehouses</CardTitle>
          <CardDescription>
            Quản lý các kho hàng và nhân sự liên quan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Staffs</TableHead>
                  <TableHead>Delivery Staffs</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có warehouse nào
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((warehouse) => {
                    const manager = getManagerForWarehouse(warehouse.id);
                    const warehouseStaffs = getStaffsForWarehouse(warehouse.id);
                    const warehouseDeliveryStaffs =
                      getDeliveryStaffsForWarehouse(warehouse.id);

                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className='font-medium'>
                          {warehouse.id}
                        </TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {warehouse.address}
                        </TableCell>
                        <TableCell>
                          {manager ? (
                            <Badge variant='default'>
                              {manager.user?.firstName ||
                                manager.user?.id ||
                                '—'}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            <IconUsers className='mr-1 h-3 w-3' />
                            {warehouseStaffs.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            <IconTruck className='mr-1 h-3 w-3' />
                            {warehouseDeliveryStaffs.length}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {warehouse.createdAt
                            ? new Date(warehouse.createdAt).toLocaleString(
                                'vi-VN'
                              )
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
