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
import { useToast } from '@/components/ui/use-toast';
import {
  IconArchive,
  IconPlus,
  IconRefresh,
  IconSearch
} from '@tabler/icons-react';
import {
  createBatch,
  fetchBatches,
  updateBatch
} from '@/services/batch.service';
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

const BATCH_CAPACITY_KG = 20;

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
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [form, setForm] = useState(defaultForm);
  const [assignForm, setAssignForm] = useState({ orderDetailId: '' });
  const [selectedBatchForAssignment, setSelectedBatchForAssignment] =
    useState<Batch | null>(null);

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
  const resetAssignForm = () => {
    setAssignForm({ orderDetailId: '' });
    setSelectedBatchForAssignment(null);
  };

  const handleSelectOrderDetail = (orderDetailId: string) => {
    const detail = orderDetails.find((item) => item.id === orderDetailId);
    const stats = orderDetailStats[orderDetailId];
    const selectedProductId = detail?.product?.id;

    // Reset importTicketId nếu ticket hiện tại không khớp product
    let importTicketId = form.importTicketId;
    if (importTicketId && selectedProductId) {
      const currentTicket = importTickets.find((t) => t.id === importTicketId);
      const ticketProductId = currentTicket?.inboundBatch?.product?.id;
      if (ticketProductId !== selectedProductId) {
        importTicketId = '';
      }
    }

    setForm((prev) => ({
      ...prev,
      orderDetailId,
      productId: selectedProductId ?? prev.productId,
      quantity: stats?.remainingQuantity ?? detail?.quantity ?? prev.quantity,
      unit: detail?.unit ?? prev.unit,
      importTicketId,
      batchCode: '' // Reset batch code khi đổi order detail
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

  const handleOpenAssignDialog = (batch: Batch) => {
    setSelectedBatchForAssignment(batch);
    setAssignForm({ orderDetailId: '' });
    setIsAssignDialogOpen(true);
  };

  const handleAssignOrderDetail = async () => {
    if (!selectedBatchForAssignment) return;
    if (!assignForm.orderDetailId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Order Detail'
      });
      return;
    }

    const detail = orderDetails.find(
      (item) => item.id === assignForm.orderDetailId
    );
    if (!detail) {
      toast({
        variant: 'destructive',
        title: 'Order Detail không hợp lệ'
      });
      return;
    }

    const detailProductId = detail.product?.id;
    if (
      detailProductId &&
      detailProductId !== selectedBatchForAssignment.product?.id
    ) {
      toast({
        variant: 'destructive',
        title: 'Lỗi xác thực',
        description: 'Product của Order Detail không khớp với batch này.'
      });
      return;
    }

    const remaining =
      orderDetailStats[detail.id]?.remainingQuantity ??
      Number(detail.quantity) ??
      0;
    const batchQuantity = Number(selectedBatchForAssignment.quantity) || 0;
    if (detail.unit?.toLowerCase() === 'kg' && remaining < batchQuantity) {
      toast({
        variant: 'destructive',
        title: 'Không đủ số lượng',
        description: `Order Detail chỉ còn ${remaining} ${detail.unit}.`
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedBatch = await updateBatch(selectedBatchForAssignment.id, {
        orderDetail: { id: assignForm.orderDetailId }
      });
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === updatedBatch.id ? updatedBatch : batch
        )
      );
      await loadBatches();
      await loadOrderDetails();
      toast({
        title: 'Đã gắn Order Detail',
        description: `Batch ${updatedBatch.batchCode} đã được cập nhật`
      });
      setIsAssignDialogOpen(false);
      resetAssignForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể cập nhật batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
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

    // Validate product khớp giữa OrderDetail và ImportTicket
    const selectedTicket = importTickets.find(
      (t) => t.id === form.importTicketId
    );
    const ticketProductId = selectedTicket?.inboundBatch?.product?.id;
    if (ticketProductId && ticketProductId !== form.productId) {
      toast({
        variant: 'destructive',
        title: 'Lỗi xác thực',
        description:
          'Product của Import Ticket không khớp với Product của Order Detail. Vui lòng chọn lại.'
      });
      return;
    }

    const ticketMeta = availableImportTickets.find(
      (ticket) => ticket.id === form.importTicketId
    );
    const remainingTicketBatches = ticketMeta?.remaining ?? 0;

    if (remainingTicketBatches <= 0) {
      toast({
        variant: 'destructive',
        title: 'Import ticket không còn batch khả dụng'
      });
      return;
    }

    const stats = orderDetailStats[form.orderDetailId];
    const isKg = form.unit.toLowerCase() === 'kg';
    const numericQuantity = Number(form.quantity) || 0;
    const targetQuantity = isKg
      ? (stats?.remainingQuantity ?? numericQuantity)
      : numericQuantity;
    let remainingQuantityForOrder = isKg ? targetQuantity : 0;
    const batchesNeededForOrder = form.orderDetailId
      ? isKg
        ? Math.max(
            Math.ceil((remainingQuantityForOrder || 0) / BATCH_CAPACITY_KG),
            0
          )
        : 1
      : 0;
    const assignableBatches = Math.min(
      batchesNeededForOrder,
      remainingTicketBatches
    );

    const baseBatchCode =
      selectedTicket?.inboundBatch?.batchCode ||
      form.batchCode ||
      selectedTicket?.id ||
      'BATCH';
    const initialUsage = importTicketUsage[form.importTicketId] ?? 0;

    try {
      setIsSubmitting(true);
      const payloads = Array.from({ length: remainingTicketBatches }).map(
        (_, index) => {
          const shouldAssignOrder =
            index < assignableBatches && Boolean(form.orderDetailId);

          let batchQuantity = Number(form.quantity) || 0;
          if (isKg) {
            batchQuantity = BATCH_CAPACITY_KG;
            if (shouldAssignOrder) {
              batchQuantity = Math.min(
                remainingQuantityForOrder || BATCH_CAPACITY_KG,
                BATCH_CAPACITY_KG
              );
              remainingQuantityForOrder =
                (remainingQuantityForOrder || 0) - batchQuantity;
            }
          }

          const batchCode = `${baseBatchCode}-${String(
            initialUsage + index + 1
          ).padStart(2, '0')}`;

          return {
            batchCode,
            quantity: batchQuantity,
            unit: form.unit,
            volume: Number(form.volume),
            product: { id: form.productId },
            importTicket: { id: form.importTicketId },
            ...(form.areaId ? { area: { id: form.areaId } } : {}),
            ...(shouldAssignOrder && form.orderDetailId
              ? { orderDetail: { id: form.orderDetailId } }
              : {})
          };
        }
      );

      const createdBatches = await Promise.all(
        payloads.map((payload) => createBatch(payload))
      );
      setBatches((prev) => [...createdBatches, ...prev]);

      const assignedCount = createdBatches.filter(
        (batch) => batch.orderDetail?.id
      ).length;

      toast({
        title: 'Đã tạo batch',
        description: `Đã tạo ${createdBatches.length} batch, gắn ${assignedCount} batch cho Order Detail`
      });

      if (isKg && (remainingQuantityForOrder || 0) > 0) {
        toast({
          title: 'Chưa đủ số lượng',
          description: `Order Detail còn thiếu khoảng ${remainingQuantityForOrder} ${form.unit}. Vui lòng chọn import ticket khác.`,
          variant: 'default'
        });
        setForm((prev) => ({
          ...prev,
          quantity: remainingQuantityForOrder || prev.quantity,
          importTicketId: '',
          batchCode: ''
        }));
      } else {
        resetForm();
        setIsDialogOpen(false);
      }
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

  const orderDetailStats = useMemo(() => {
    const assignedQuantity = batches.reduce<Record<string, number>>(
      (acc, batch) => {
        const id = batch.orderDetail?.id;
        if (id) {
          acc[id] = (acc[id] ?? 0) + (Number(batch.quantity) || 0);
        }
        return acc;
      },
      {}
    );

    return orderDetails.reduce<Record<string, { remainingQuantity: number }>>(
      (acc, detail) => {
        const total = Number(detail.quantity) || 0;
        const used = assignedQuantity[detail.id] ?? 0;
        acc[detail.id] = {
          remainingQuantity: Math.max(total - used, 0)
        };
        return acc;
      },
      {}
    );
  }, [batches, orderDetails]);

  const availableImportTickets = useMemo(() => {
    const selectedProductId = form.productId;

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
      .filter((ticket) => {
        // Lọc theo số batch còn lại
        if (ticket.remaining <= 0) return false;

        // Nếu đã chọn order detail (có productId), chỉ hiển thị ticket có product khớp
        if (selectedProductId) {
          const ticketProductId = ticket.inboundBatch?.product?.id;
          return ticketProductId === selectedProductId;
        }

        // Nếu chưa chọn order detail, hiển thị tất cả
        return true;
      });
  }, [importTickets, importTicketUsage, form.productId]);

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

  const availableOrderDetails = useMemo(
    () =>
      orderDetails.filter((detail) => {
        const stats = orderDetailStats[detail.id];
        if (!stats) return true;
        return stats.remainingQuantity > 0;
      }),
    [orderDetails, orderDetailStats]
  );

  const assignedBatches = useMemo(
    () => filteredTickets.filter((batch) => Boolean(batch.orderDetail?.id)),
    [filteredTickets]
  );

  const unassignedBatches = useMemo(
    () => filteredTickets.filter((batch) => !batch.orderDetail?.id),
    [filteredTickets]
  );

  const assignableOrderDetails = useMemo(() => {
    if (!selectedBatchForAssignment) {
      return orderDetails.filter((detail) => {
        const stats = orderDetailStats[detail.id];
        return (stats?.remainingQuantity ?? Number(detail.quantity) ?? 0) > 0;
      });
    }
    const batchProductId = selectedBatchForAssignment.product?.id;
    return orderDetails.filter((detail) => {
      const stats = orderDetailStats[detail.id];
      const remaining =
        stats?.remainingQuantity ?? Number(detail.quantity) ?? 0;
      if (remaining <= 0) return false;
      if (batchProductId) {
        return detail.product?.id === batchProductId;
      }
      return true;
    });
  }, [orderDetails, orderDetailStats, selectedBatchForAssignment]);

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
                      {availableOrderDetails.map((detail) => {
                        const stats = orderDetailStats[detail.id];
                        const remainingLabel =
                          stats && detail.unit?.toLowerCase() === 'kg'
                            ? ` • còn ${stats.remainingQuantity} ${detail.unit}`
                            : '';
                        return (
                          <SelectItem key={detail.id} value={detail.id}>
                            {detail.id} •{' '}
                            {detail.product?.name ||
                              detail.product?.id ||
                              'Không có sản phẩm'}
                            {remainingLabel}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedOrderDetail ? (
                    <p className='text-muted-foreground text-xs'>
                      Số lượng: {selectedOrderDetail.quantity ?? '—'}{' '}
                      {selectedOrderDetail.unit ?? ''}{' '}
                      {orderDetailStats[selectedOrderDetail.id]
                        ?.remainingQuantity !== undefined
                        ? `(Còn lại ${orderDetailStats[selectedOrderDetail.id]?.remainingQuantity} ${
                            selectedOrderDetail.unit ?? ''
                          })`
                        : null}
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
                    disabled={!form.productId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !form.productId
                            ? 'Vui lòng chọn Order Detail trước'
                            : availableImportTickets.length === 0
                              ? 'Không có import ticket khả dụng cho sản phẩm này'
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
                    {!form.productId
                      ? 'Vui lòng chọn Order Detail trước để hiển thị import ticket phù hợp.'
                      : 'Chỉ hiển thị các import ticket có product khớp với Order Detail đã chọn.'}
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
          <CardTitle>Batch đã gắn Order Detail</CardTitle>
          <CardDescription>
            Các batch đã được phân bổ cho đơn hàng.
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
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : assignedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có batch nào được gắn Order Detail
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.importTicket?.id ?? '—'}</TableCell>
                      <TableCell>{batch.orderDetail?.id ?? '—'}</TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>Batch chưa gắn Order Detail</CardTitle>
          <CardDescription>
            Batch còn trống để tiếp tục phân bổ cho đơn hàng khác.
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
                ) : unassignedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Không có batch trống
                    </TableCell>
                  </TableRow>
                ) : (
                  unassignedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.importTicket?.id ?? '—'}</TableCell>
                      <TableCell>{batch.orderDetail?.id ?? '—'}</TableCell>
                      <TableCell>{batch.product?.id ?? '—'}</TableCell>
                      <TableCell>{batch.area?.id ?? '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {batch.createdAt
                          ? new Date(batch.createdAt).toLocaleString('vi-VN')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleOpenAssignDialog(batch)}
                        >
                          Gắn Order Detail
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

      <Dialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAssignForm();
          }
          setIsAssignDialogOpen(open);
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Gắn Order Detail cho batch</DialogTitle>
            <DialogDescription>
              Chọn Order Detail còn số lượng để gắn vào batch chưa có Order
              Detail.
            </DialogDescription>
          </DialogHeader>
          {selectedBatchForAssignment ? (
            <div className='space-y-4'>
              <div className='rounded-md border p-3 text-sm'>
                <p>
                  <span className='font-medium'>Batch:</span>{' '}
                  {selectedBatchForAssignment.batchCode}
                </p>
                <p>
                  <span className='font-medium'>Số lượng:</span>{' '}
                  {selectedBatchForAssignment.quantity}{' '}
                  {selectedBatchForAssignment.unit}
                </p>
                <p>
                  <span className='font-medium'>Product:</span>{' '}
                  {selectedBatchForAssignment.product?.id ?? '—'}
                </p>
              </div>
              <div className='space-y-2'>
                <Label>Order Detail</Label>
                <Select
                  value={assignForm.orderDetailId}
                  onValueChange={(value) =>
                    setAssignForm({ orderDetailId: value })
                  }
                  disabled={assignableOrderDetails.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        assignableOrderDetails.length === 0
                          ? 'Không còn Order Detail phù hợp'
                          : 'Chọn Order Detail'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableOrderDetails.map((detail) => {
                      const stats = orderDetailStats[detail.id];
                      const remainingLabel =
                        stats?.remainingQuantity !== undefined
                          ? ` • còn ${stats.remainingQuantity} ${detail.unit ?? ''}`
                          : '';
                      return (
                        <SelectItem key={detail.id} value={detail.id}>
                          {detail.id} •{' '}
                          {detail.product?.name ||
                            detail.product?.id ||
                            'Không có sản phẩm'}
                          {remainingLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <div className='flex justify-end gap-2 pt-2'>
            <Button
              variant='outline'
              onClick={() => {
                setIsAssignDialogOpen(false);
                resetAssignForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAssignOrderDetail} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Gắn Order Detail'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
