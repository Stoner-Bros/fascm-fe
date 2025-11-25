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
  IconArchive,
  IconPlus,
  IconRefresh,
  IconSearch
} from '@tabler/icons-react';
import { createBatch, fetchBatches } from '@/services/batch.service';
import { fetchImportTickets } from '@/services/import-ticket.service';
import { fetchOrderDetails } from '@/services/order-detail.service';
import type { Batch } from '@/types/batch';
import type { ImportTicket } from '@/types/import-ticket';
import type { OrderDetail } from '@/types/order-detail';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const defaultForm = {
  batchCode: '',
  quantity: 0,
  unit: 'kg',
  volume: 0,
  productId: '',
  importTicketId: '',
  areaId: '',
  orderDetailId: ''
};

export function BatchManagement() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [importTickets, setImportTickets] = useState<ImportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [form, setForm] = useState(defaultForm);

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBatches({
        page: 1,
        limit: 50,
        search: filters.search || undefined
      });
      setBatches(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadImportTickets = async () => {
    try {
      const res = await fetchImportTickets({ page: 1, limit: 100 });
      setImportTickets(res.data);
    } catch (error) {
      console.error('Unable to load import tickets', error);
    }
  };

  const loadOrderDetails = async () => {
    setIsLoadingOrderDetails(true);
    try {
      const res = await fetchOrderDetails({ page: 1, limit: 100 });
      setOrderDetails(res.data);
    } catch (error) {
      console.error('Unable to load order details', error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  useEffect(() => {
    loadBatches();
    loadImportTickets();
    loadOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
  };

  const handleSelectOrderDetail = (orderDetailId: string) => {
    const detail = orderDetails.find((item) => item.id === orderDetailId);
    setForm((prev) => ({
      ...prev,
      orderDetailId,
      productId: detail?.product?.id ?? prev.productId,
      quantity: detail?.quantity ?? prev.quantity,
      unit: detail?.unit ?? prev.unit
    }));
  };

  const handleSelectImportTicket = (ticketId: string) => {
    const ticket = importTickets.find((item) => item.id === ticketId);
    const used = importTicketUsage[ticketId] ?? 0;
    const derivedCode = ticket?.inboundBatch?.batchCode
      ? `${ticket.inboundBatch.batchCode}-${String(used + 1).padStart(2, '0')}`
      : form.batchCode;
    setForm((prev) => ({
      ...prev,
      importTicketId: ticketId,
      batchCode: derivedCode
    }));
  };

  const handleCreate = async () => {
    if (!form.batchCode || !form.importTicketId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Import Ticket và Batch Code'
      });
      return;
    }

    if (!form.orderDetailId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Order Detail'
      });
      return;
    }

    if (!form.productId) {
      toast({
        variant: 'destructive',
        title: 'Order Detail chưa có thông tin sản phẩm'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        batchCode: form.batchCode,
        quantity: Number(form.quantity),
        unit: form.unit,
        volume: Number(form.volume),
        product: { id: form.productId },
        importTicket: { id: form.importTicketId },
        ...(form.areaId ? { area: { id: form.areaId } } : {}),
        ...(form.orderDetailId
          ? { orderDetail: { id: form.orderDetailId } }
          : {})
      };

      const newBatch = await createBatch(payload);
      setBatches((prev) => [newBatch, ...prev]);
      toast({
        title: 'Đã tạo batch',
        description: `Batch ${newBatch.batchCode} đã được tạo thành công`
      });
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const importTicketUsage = useMemo(() => {
    return batches.reduce<Record<string, number>>((acc, batch) => {
      const id = batch.importTicket?.id;
      if (id) {
        acc[id] = (acc[id] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [batches]);

  const availableImportTickets = useMemo(() => {
    return importTickets
      .map((ticket) => {
        const used = importTicketUsage[ticket.id] ?? 0;
        const remaining = Math.max((ticket.numberOfBatch ?? 1) - used, 0);
        return {
          ...ticket,
          remaining,
          used
        };
      })
      .filter((ticket) => ticket.remaining > 0);
  }, [importTickets, importTicketUsage]);

  const filteredTickets = useMemo(() => {
    if (!filters.search) return batches;
    const keyword = filters.search.toLowerCase();
    return batches.filter(
      (batch) =>
        batch.id.toLowerCase().includes(keyword) ||
        batch.batchCode.toLowerCase().includes(keyword) ||
        batch.product?.id?.toLowerCase().includes(keyword)
    );
  }, [batches, filters.search]);

  const selectedImportTicket = useMemo(
    () => importTickets.find((ticket) => ticket.id === form.importTicketId),
    [importTickets, form.importTicketId]
  );

  const selectedOrderDetail = useMemo(
    () => orderDetails.find((detail) => detail.id === form.orderDetailId),
    [orderDetails, form.orderDetailId]
  );

  const usedOrderDetailIds = useMemo(() => {
    return new Set(
      batches
        .map((batch) => batch.orderDetail?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [batches]);

  const availableOrderDetails = useMemo(
    () => orderDetails.filter((detail) => !usedOrderDetailIds.has(detail.id)),
    [orderDetails, usedOrderDetailIds]
  );

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconArchive className='h-8 w-8 text-emerald-600' />
            Batch Manage
          </h1>
          <p className='text-muted-foreground'>
            Tạo batch từ import ticket và quản lý thông tin batch.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={loadBatches}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo batch
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Tạo batch</DialogTitle>
                <DialogDescription>
                  Điền thông tin batch dựa trên import ticket và kho.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='batchCode'>Batch Code *</Label>
                  <Input
                    id='batchCode'
                    value={form.batchCode}
                    readOnly
                    placeholder='Chọn import ticket để tự sinh'
                  />
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Số lượng *</Label>
                    <Input
                      id='quantity'
                      type='number'
                      min={0}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='unit'>Đơn vị *</Label>
                    <Input
                      id='unit'
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      placeholder='VD: kg'
                    />
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='volume'>Thể tích</Label>
                    <Input
                      id='volume'
                      type='number'
                      min={0}
                      value={form.volume}
                      onChange={(e) =>
                        setForm({ ...form, volume: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='areaId'>Area ID (tùy chọn)</Label>
                    <Input
                      id='areaId'
                      value={form.areaId}
                      onChange={(e) =>
                        setForm({ ...form, areaId: e.target.value })
                      }
                      placeholder='Nhập Area ID'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label>Order Detail *</Label>
                  <Select
                    value={form.orderDetailId}
                    onValueChange={handleSelectOrderDetail}
                    disabled={
                      isLoadingOrderDetails ||
                      availableOrderDetails.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingOrderDetails
                            ? 'Đang tải order detail...'
                            : availableOrderDetails.length === 0
                              ? 'Không có order detail khả dụng'
                              : 'Chọn order detail'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOrderDetails.map((detail) => (
                        <SelectItem key={detail.id} value={detail.id}>
                          {detail.id} •{' '}
                          {detail.product?.name ||
                            detail.product?.id ||
                            'Không có sản phẩm'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOrderDetail ? (
                    <p className='text-muted-foreground text-xs'>
                      Số lượng: {selectedOrderDetail.quantity ?? '—'}{' '}
                      {selectedOrderDetail.unit ?? ''}
                    </p>
                  ) : (
                    <p className='text-muted-foreground text-xs'>
                      Chọn order detail để hệ thống tự điền sản phẩm.
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='productId'>Product ID *</Label>
                  <Input
                    id='productId'
                    value={form.productId}
                    readOnly
                    placeholder='Chọn order detail để tự điền'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='importTicketId'>Import Ticket *</Label>
                  <Select
                    value={form.importTicketId}
                    onValueChange={handleSelectImportTicket}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableImportTickets.length === 0
                            ? 'Không còn import ticket khả dụng'
                            : 'Chọn import ticket'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableImportTickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.id} • còn {ticket.remaining}/
                          {ticket.numberOfBatch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-muted-foreground text-xs'>
                    Các import ticket đã đủ số batch sẽ không hiển thị.
                  </p>
                </div>
                {selectedImportTicket && (
                  <div className='rounded-md border border-dashed p-3 text-sm'>
                    <p className='font-medium'>
                      Import Ticket: {selectedImportTicket.id}
                    </p>
                    <p>
                      Inbound Batch:{' '}
                      {selectedImportTicket.inboundBatch?.id ?? 'Không có'}
                    </p>
                    <p>
                      Batch Code gợi ý:{' '}
                      {selectedImportTicket.inboundBatch?.batchCode
                        ? `${selectedImportTicket.inboundBatch.batchCode}-${String(
                            (importTicketUsage[selectedImportTicket.id] ?? 0) +
                              1
                          ).padStart(2, '0')}`
                        : 'Chưa xác định'}
                    </p>
                  </div>
                )}
                {/* Order detail selection already handled above */}
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo batch'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-1 gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo batch code, product ID...'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
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
          <CardTitle>Danh sách batches</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các batch trong kho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Import Ticket</TableHead>
                  <TableHead>Order Detail</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có batch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.importTicket?.id ?? '—'}</TableCell>
                      <TableCell>
                        {batch.orderDetail?.id ?? form.orderDetailId ?? '—'}
                      </TableCell>
                      <TableCell>{batch.product?.id ?? '—'}</TableCell>
                      <TableCell>{batch.area?.id ?? '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {batch.createdAt
                          ? new Date(batch.createdAt).toLocaleString('vi-VN')
                          : '—'}
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
