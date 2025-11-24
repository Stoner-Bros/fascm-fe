'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  IconAlertCircle,
  IconBox,
  IconPlus,
  IconRefresh,
  IconSearch
} from '@tabler/icons-react';
import {
  createInboundBatch,
  fetchInboundBatches
} from '@/services/inbound-batch.service';
import { fetchHarvestDetails } from '@/services/harvest-detail.service';
import type { HarvestDetail, InboundBatch } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function InboundDelivery() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<InboundBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHarvestDetailsLoading, setIsHarvestDetailsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [harvestDetails, setHarvestDetails] = useState<HarvestDetail[]>([]);
  const [form, setForm] = useState({
    batchCode: '',
    quantity: 0,
    unit: 'kg',
    productId: '',
    harvestDetailId: ''
  });

  const generateBatchCode = () =>
    `IB-${new Date().toISOString().replace(/[-:.TZ]/g, '')}`;

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
        title: 'Không thể tải danh sách inbound batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHarvestDetails = async () => {
    setIsHarvestDetailsLoading(true);
    try {
      const res = await fetchHarvestDetails({
        page: 1,
        limit: 100
      });
      setHarvestDetails(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách harvest detail',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsHarvestDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    loadHarvestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () =>
    setForm({
      batchCode: '',
      quantity: 0,
      unit: 'kg',
      productId: '',
      harvestDetailId: ''
    });

  const handleHarvestDetailChange = (value: string) => {
    const detail = harvestDetails.find((item) => item.id === value);
    setForm((prev) => ({
      ...prev,
      harvestDetailId: value,
      quantity: Number(detail?.quantity ?? 0),
      unit: detail?.unit ?? 'kg',
      productId: detail?.product?.id ?? ''
    }));
  };

  const handleCreate = async () => {
    if (!form.harvestDetailId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Harvest Detail'
      });
      return;
    }

    if (!selectedHarvestDetail) {
      toast({
        variant: 'destructive',
        title: 'Harvest Detail không hợp lệ'
      });
      return;
    }

    const productId = selectedHarvestDetail.product?.id;
    const quantity = Number(selectedHarvestDetail.quantity ?? 0);
    const unit = selectedHarvestDetail.unit ?? 'kg';

    if (!productId) {
      toast({
        variant: 'destructive',
        title: 'Harvest Detail chưa có thông tin sản phẩm'
      });
      return;
    }

    if (!quantity) {
      toast({
        variant: 'destructive',
        title: 'Harvest Detail chưa có số lượng hợp lệ'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newBatch = await createInboundBatch({
        batchCode: form.batchCode || generateBatchCode(),
        quantity,
        unit,
        product: { id: productId },
        harvestDetail: { id: selectedHarvestDetail.id }
      });

      setBatches((prev) => [newBatch, ...prev]);
      toast({
        title: 'Đã tạo inbound batch',
        description: `Lô ${newBatch.batchCode} đã sẵn sàng`
      });
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo inbound batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedHarvestDetail = useMemo(
    () => harvestDetails.find((detail) => detail.id === form.harvestDetailId),
    [harvestDetails, form.harvestDetailId]
  );

  const usedHarvestDetailIds = useMemo(() => {
    return new Set(
      batches
        .map((batch) => batch.harvestDetail?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [batches]);

  const availableHarvestDetails = useMemo(
    () =>
      harvestDetails.filter((detail) => !usedHarvestDetailIds.has(detail.id)),
    [harvestDetails, usedHarvestDetailIds]
  );

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
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconBox className='h-8 w-8 text-emerald-600' />
            Inbound Batches
          </h1>
          <p className='text-muted-foreground'>
            Tạo và quản lý lô nhập kho đồng bộ với hệ thống harvest
          </p>
        </div>
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
              } else {
                setForm((prev) => ({
                  ...prev,
                  batchCode: generateBatchCode()
                }));
                if (harvestDetails.length === 0 && !isHarvestDetailsLoading) {
                  void loadHarvestDetails();
                }
              }
              setIsCreateDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo inbound batch
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-xl'>
              <DialogHeader>
                <DialogTitle>Tạo inbound batch</DialogTitle>
                <DialogDescription>
                  Liên kết với mã sản phẩm và harvest detail tương ứng
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='batchCode'>Mã lô</Label>
                  <Input
                    id='batchCode'
                    value={form.batchCode}
                    readOnly
                    disabled
                    // placeholder='BC-XXXXXXXX'
                  />
                  <p className='text-muted-foreground text-xs'>
                    Mã lô được hệ thống tự sinh (batchID).
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='harvestDetailId'>Harvest Detail</Label>
                  <Select
                    value={form.harvestDetailId}
                    onValueChange={handleHarvestDetailChange}
                    disabled={
                      isHarvestDetailsLoading ||
                      availableHarvestDetails.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isHarvestDetailsLoading
                            ? 'Đang tải...'
                            : availableHarvestDetails.length === 0
                              ? 'Tất cả harvest detail đã được sử dụng'
                              : 'Chọn harvest detail'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHarvestDetails.map((detail) => (
                        <SelectItem key={detail.id} value={detail.id}>
                          {detail.id} •{' '}
                          {detail.product?.id ?? 'Chưa có sản phẩm'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-muted-foreground text-xs'>
                    Tạm thời hiển thị toàn bộ Harvest Detail chưa được tạo
                    inbound.
                  </p>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Số lượng</Label>
                    <Input
                      value={
                        form.harvestDetailId
                          ? String(
                              form.quantity ||
                                selectedHarvestDetail?.quantity ||
                                0
                            )
                          : ''
                      }
                      readOnly
                      disabled
                      placeholder='Chọn harvest detail'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Đơn vị</Label>
                    <Input
                      value={
                        form.harvestDetailId
                          ? (selectedHarvestDetail?.unit ?? form.unit)
                          : ''
                      }
                      readOnly
                      disabled
                      placeholder='Chọn harvest detail'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label>ID sản phẩm</Label>
                  <Input
                    value={
                      form.harvestDetailId
                        ? (selectedHarvestDetail?.product?.id ?? form.productId)
                        : ''
                    }
                    readOnly
                    disabled
                    placeholder='Chọn harvest detail'
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan inbound</CardTitle>
          <CardDescription>
            Số liệu được lấy trực tiếp từ API /api/v1/inbound-batches
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-3'>
          <div>
            <p className='text-muted-foreground text-sm'>Tổng số lô</p>
            <p className='text-3xl font-semibold'>{summary.totalBatches}</p>
          </div>
          {/* <div>
            <p className='text-sm text-muted-foreground'>Tổng số lượng</p>
            <p className='text-3xl font-semibold'>
              {summary.totalQuantity.toLocaleString('vi-VN')} {batches[0]?.unit || 'đv'}
            </p>
          </div> */}
          <div className='flex items-center gap-2'>
            <IconAlertCircle className='text-amber-500' />
            <p className='text-muted-foreground text-sm'>
              Hãy đảm bảo mã sản phẩm và harvest detail chính xác trước khi tạo
              lô.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-wrap gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo mã lô, ID sản phẩm, harvest detail...'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className='pl-10'
              />
            </div>
            <Button variant='outline' onClick={loadBatches}>
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách inbound batches</CardTitle>
          <CardDescription>Hiển thị các lô nhập kho mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lô</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Harvest detail</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : batches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có inbound batch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.product?.id ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {batch.quantity.toLocaleString('vi-VN')} {batch.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.harvestDetail?.id ?? '—'}</TableCell>
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
