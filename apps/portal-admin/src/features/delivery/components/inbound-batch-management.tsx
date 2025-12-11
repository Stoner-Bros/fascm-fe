'use client';

import { useEffect, useMemo, useState } from 'react';
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
  createInboundBatch,
  deleteInboundBatch,
  fetchInboundBatches
} from '@/services/inbound-batch.service';
import type { InboundBatch } from '@/types';
import {
  IconAlertCircle,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';

export function InboundBatchManagement() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<InboundBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [form, setForm] = useState({
    batchCode: '',
    quantity: 0,
    unit: 'kg',
    productId: '',
    harvestDetailId: ''
  });

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetchInboundBatches({
        page: 1,
        limit: 50,
        search: filters.search || undefined
      });
      setBatches(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách lô inbound',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadBatches();
  };

  const resetForm = () =>
    setForm({
      batchCode: '',
      quantity: 0,
      unit: 'kg',
      productId: '',
      harvestDetailId: ''
    });

  const handleCreate = async () => {
    if (!form.batchCode || !form.productId || !form.harvestDetailId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newBatch = await createInboundBatch({
        batchCode: form.batchCode,
        quantity: Number(form.quantity),
        unit: form.unit,
        product: { id: form.productId },
        harvestDetail: { id: form.harvestDetailId }
      });
      setBatches((prev) => [newBatch, ...prev]);
      toast({
        title: 'Đã tạo lô inbound',
        description: `Lô ${newBatch.batchCode} sẵn sàng để sử dụng`
      });
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo lô inbound',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Xóa lô inbound này?');
    if (!confirmDelete) return;

    try {
      setRemovingId(id);
      await deleteInboundBatch(id);
      setBatches((prev) => prev.filter((batch) => batch.id !== id));
      toast({ title: 'Đã xóa lô inbound' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa lô inbound',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setRemovingId(null);
    }
  };

  const summary = useMemo(() => {
    const totalQuantity = batches.reduce(
      (sum, batch) => sum + batch.quantity,
      0
    );
    return {
      totalBatches: batches.length,
      totalQuantity
    };
  }, [batches]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-emerald-100 p-2'>
              <IconPackage className='h-6 w-6 text-emerald-700' />
            </div>
            <div>
              <CardTitle>Quản lý lô inbound</CardTitle>
              <CardDescription>
                Kiểm soát các lô hàng nhập kho và đồng bộ với harvesting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-3'>
          <div>
            <p className='text-muted-foreground text-sm'>Tổng số lô</p>
            <p className='text-3xl font-semibold'>{summary.totalBatches}</p>
          </div>
          <div>
            <p className='text-muted-foreground text-sm'>Tổng số lượng</p>
            <p className='text-3xl font-semibold'>
              {summary.totalQuantity.toLocaleString('vi-VN')}{' '}
              {batches[0]?.unit || 'đv'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <IconAlertCircle className='text-amber-500' />
            <p className='text-muted-foreground text-sm'>
              Đồng bộ mã sản phẩm và harvest detail trước khi tạo lô.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' onClick={loadBatches}>
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
                  Tạo lô inbound
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-xl'>
                <DialogHeader>
                  <DialogTitle>Tạo lô inbound</DialogTitle>
                  <DialogDescription>
                    Điền thông tin chi tiết để tạo lô hàng nhập kho
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='batchCode'>Mã lô</Label>
                    <Input
                      id='batchCode'
                      value={form.batchCode}
                      onChange={(e) =>
                        setForm({ ...form, batchCode: e.target.value })
                      }
                      placeholder='VD: IB-2024-001'
                    />
                  </div>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='quantity'>Số lượng</Label>
                      <Input
                        id='quantity'
                        type='number'
                        min={0}
                        value={form.quantity}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            quantity: Number(e.target.value)
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Đơn vị</Label>
                      <Select
                        value={form.unit}
                        onValueChange={(value) =>
                          setForm({ ...form, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn đơn vị' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='kg'>Kilogram (kg)</SelectItem>
                          <SelectItem value='ton'>Tấn</SelectItem>
                          <SelectItem value='box'>Thùng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='productId'>ID sản phẩm</Label>
                    <Input
                      id='productId'
                      value={form.productId}
                      onChange={(e) =>
                        setForm({ ...form, productId: e.target.value })
                      }
                      placeholder='Nhập ID sản phẩm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='harvestDetailId'>ID harvest detail</Label>
                    <Input
                      id='harvestDetailId'
                      value={form.harvestDetailId}
                      onChange={(e) =>
                        setForm({ ...form, harvestDetailId: e.target.value })
                      }
                      placeholder='Nhập ID harvest detail'
                    />
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
                    {isSubmitting ? 'Đang xử lý...' : 'Tạo lô'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo mã lô, sản phẩm...'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className='pl-10'
              />
            </div>
            <Button variant='outline' onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lô inbound</CardTitle>
          <CardDescription>
            Danh sách được đồng bộ từ backend /api/v1/inbound-batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lô</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Harvest detail</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className='w-[100px]'>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : batches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có lô inbound nào
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>
                        {batch.batchCode}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {batch.quantity.toLocaleString('vi-VN')} {batch.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {batch.harvestInvoiceDetail.product?.id ?? '—'}
                      </TableCell>
                      <TableCell>
                        {batch.harvestInvoiceDetail?.id ?? '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        <div>
                          Tạo:{' '}
                          {batch.createdAt
                            ? new Date(batch.createdAt).toLocaleString('vi-VN')
                            : '—'}
                        </div>
                        <div>
                          Cập nhật:{' '}
                          {batch.updatedAt
                            ? new Date(batch.updatedAt).toLocaleString('vi-VN')
                            : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='destructive'
                          size='icon'
                          onClick={() => handleDelete(batch.id)}
                          disabled={removingId === batch.id}
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
