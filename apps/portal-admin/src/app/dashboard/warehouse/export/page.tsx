'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Plus, Trash2, Package, Weight, CheckCircle2 } from 'lucide-react';
import {
  fetchExportTickets,
  createExportTicket,
  deleteExportTicket,
  type ExportTicket,
  type OrderInvoiceDetailWithBatch
} from '@/services/export-ticket.service';
import {
  fetchBatchesGroupedByWeight,
  fetchBatches
} from '@/services/batch.service';
import { fetchAreas } from '@/services/area.service';
import { fetchOrderPhasesBySchedule } from '@/services/order-phase.service';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import type { Area } from '@/types/area';
import type { OrderSchedule, OrderPhase } from '@/types/order';
import type { Batch } from '@/types/batch';
import { useToast } from '@/components/ui/use-toast';

type BatchGroupedByWeight = {
  importTicketId: string;
  product: {
    id: string;
    name?: string;
  };
  batch: Record<string, number>;
  batchCode: string;
  expiredAt?: Date | null;
  importDate?: Date;
  prices: Record<string, number>;
};

type InvoiceDetailSelection = {
  orderInvoiceDetailId: string;
  productName: string;
  quantity: number;
  unit: string;
  selectedBatches: {
    batchId: string;
    weight: string;
    batchCode: string;
  }[];
};

export default function ExportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ExportTicket[]>([]);
  const [orderSchedules, setOrderSchedules] = useState<OrderSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<OrderSchedule | null>(null);
  const [phases, setPhases] = useState<OrderPhase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<OrderPhase | null>(null);
  const [batchesGrouped, setBatchesGrouped] = useState<BatchGroupedByWeight[]>(
    []
  );
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const [selectedAreaId, setSelectedAreaId] = useState<string>('');

  const [invoiceDetailSelections, setInvoiceDetailSelections] = useState<
    InvoiceDetailSelection[]
  >([]);

  const loadTickets = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetchExportTickets({
        page: pageNum,
        limit
      });
      setTickets(response.data);
      setHasMore(response.hasNextPage ?? false);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phiếu xuất kho',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderSchedules = async () => {
    try {
      const response = await fetchOrderSchedules({
        page: 1,
        limit: 100,
        status: 'approved'
      });
      setOrderSchedules(response.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch giao hàng',
        variant: 'destructive'
      });
    }
  };

  const loadPhases = async (scheduleId: string) => {
    try {
      const response = await fetchOrderPhasesBySchedule({
        orderScheduleId: scheduleId,
        limit: 50
      });
      setPhases(response.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đợt giao hàng',
        variant: 'destructive'
      });
    }
  };

  const loadBatchesGrouped = async (productId?: string) => {
    try {
      const filters: any = {};
      if (selectedAreaId) filters.areaId = selectedAreaId;
      if (productId) filters.productId = productId;

      const response = await fetchBatchesGroupedByWeight(filters);
      setBatchesGrouped(response);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lô hàng',
        variant: 'destructive'
      });
    }
  };

  const loadAvailableBatches = async (productId: string) => {
    try {
      const filters: any = { productId };
      if (selectedAreaId) filters.areaId = selectedAreaId;

      const response = await fetchBatches(filters);
      setAvailableBatches(response.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lô hàng chi tiết',
        variant: 'destructive'
      });
    }
  };

  const loadAreas = async () => {
    try {
      const response = await fetchAreas({ page: 1, limit: 100 });
      setAreas(response.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khu vực',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadTickets(page);
  }, [page]);

  useEffect(() => {
    loadAreas();
    loadOrderSchedules();
  }, []);

  useEffect(() => {
    if (selectedPhase && selectedPhase.orderInvoiceDetails) {
      const selections: InvoiceDetailSelection[] =
        selectedPhase.orderInvoiceDetails.map((detail) => ({
          orderInvoiceDetailId: detail.id,
          productName: detail.product?.name || 'Unknown',
          quantity: detail.quantity || 0,
          unit: detail.unit || '',
          selectedBatches: []
        }));
      setInvoiceDetailSelections(selections);
    }
  }, [selectedPhase]);

  const handleScheduleSelect = async (scheduleId: string) => {
    const schedule = orderSchedules.find((s) => s.id === scheduleId);
    setSelectedSchedule(schedule || null);
    setSelectedPhase(null);
    setPhases([]);
    setInvoiceDetailSelections([]);

    if (schedule) {
      await loadPhases(scheduleId);
    }
  };

  const handlePhaseSelect = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId);
    setSelectedPhase(phase || null);
  };

  const handleAddBatchToDetail = (
    detailId: string,
    batchId: string,
    weight: string,
    batchCode: string
  ) => {
    setInvoiceDetailSelections((prev) =>
      prev.map((sel) => {
        if (sel.orderInvoiceDetailId === detailId) {
          if (sel.selectedBatches.some((b) => b.batchId === batchId)) {
            return sel;
          }
          return {
            ...sel,
            selectedBatches: [
              ...sel.selectedBatches,
              { batchId, weight, batchCode }
            ]
          };
        }
        return sel;
      })
    );
  };

  const handleRemoveBatchFromDetail = (detailId: string, batchId: string) => {
    setInvoiceDetailSelections((prev) =>
      prev.map((sel) => {
        if (sel.orderInvoiceDetailId === detailId) {
          return {
            ...sel,
            selectedBatches: sel.selectedBatches.filter(
              (b) => b.batchId !== batchId
            )
          };
        }
        return sel;
      })
    );
  };

  const handleCreate = async () => {
    const invalidDetails = invoiceDetailSelections.filter(
      (sel) => sel.selectedBatches.length === 0
    );

    if (invalidDetails.length > 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn lô hàng cho tất cả sản phẩm',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload: { invoiceDetails: OrderInvoiceDetailWithBatch[] } = {
        invoiceDetails: invoiceDetailSelections.map((sel) => ({
          orderInvoiceDetailId: sel.orderInvoiceDetailId,
          batchIds: sel.selectedBatches.map((b) => b.batchId)
        }))
      };

      await createExportTicket(payload);

      toast({
        title: 'Thành công',
        description: 'Tạo phiếu xuất kho thành công'
      });

      setIsCreateDialogOpen(false);
      resetFormData();
      loadTickets(page);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể tạo phiếu xuất kho',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu xuất kho này?')) return;

    try {
      await deleteExportTicket(id);
      toast({
        title: 'Thành công',
        description: 'Xóa phiếu xuất kho thành công'
      });
      loadTickets(page);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phiếu xuất kho',
        variant: 'destructive'
      });
    }
  };

  const resetFormData = () => {
    setSelectedSchedule(null);
    setSelectedPhase(null);
    setPhases([]);
    setInvoiceDetailSelections([]);
    setSelectedAreaId('');
    setBatchesGrouped([]);
    setAvailableBatches([]);
  };

  const getTotalSelectedBatches = () => {
    return invoiceDetailSelections.reduce(
      (sum, sel) => sum + sel.selectedBatches.length,
      0
    );
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Phiếu xuất kho</h1>
          <p className='text-muted-foreground mt-1'>
            Quản lý các phiếu xuất hàng từ đơn giao hàng
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Tạo phiếu xuất
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu xuất kho</CardTitle>
          <CardDescription>Các phiếu xuất hàng đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className='py-8 text-center'>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-muted-foreground py-8 text-center'
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className='font-mono text-sm'>
                        {ticket.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>
                          {new Date(ticket.createdAt).toLocaleDateString(
                            'vi-VN',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>
                          {new Date(ticket.updatedAt).toLocaleDateString(
                            'vi-VN',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className='text-destructive h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              Trang {page} {hasMore ? '- có thêm dữ liệu' : '- hết dữ liệu'}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1 || loading}
              >
                Trang trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Tạo phiếu xuất kho</DialogTitle>
            <DialogDescription>
              Chọn lịch, đợt giao hàng và lô hàng tương ứng
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='orderSchedule'>
                Bước 1: Chọn lịch giao hàng *
              </Label>
              <Select
                value={selectedSchedule?.id || ''}
                onValueChange={handleScheduleSelect}
              >
                <SelectTrigger id='orderSchedule'>
                  <SelectValue placeholder='Chọn lịch...' />
                </SelectTrigger>
                <SelectContent>
                  {orderSchedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {schedule.consignee?.organizationName || 'N/A'}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          {schedule.deliveryDate
                            ? new Date(
                                schedule.deliveryDate
                              ).toLocaleDateString('vi-VN')
                            : '-'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSchedule && phases.length > 0 && (
              <div>
                <Label htmlFor='phase'>Bước 2: Chọn đợt giao hàng *</Label>
                <Select
                  value={selectedPhase?.id || ''}
                  onValueChange={handlePhaseSelect}
                >
                  <SelectTrigger id='phase'>
                    <SelectValue placeholder='Chọn đợt...' />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        Đợt {phase.phaseNumber}: {phase.description || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPhase && invoiceDetailSelections.length > 0 && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label>Bước 3: Chọn lô hàng *</Label>
                  <Badge variant='outline'>
                    Đã chọn: {getTotalSelectedBatches()} lô
                  </Badge>
                </div>

                <div>
                  <Label htmlFor='filterArea'>Lọc theo khu vực</Label>
                  <Select
                    value={selectedAreaId}
                    onValueChange={setSelectedAreaId}
                  >
                    <SelectTrigger id='filterArea'>
                      <SelectValue placeholder='Tất cả' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>Tất cả</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {invoiceDetailSelections.map((selection, index) => (
                  <Card key={selection.orderInvoiceDetailId}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-lg'>
                            {selection.productName}
                          </CardTitle>
                          <p className='text-muted-foreground text-sm'>
                            Số lượng: {selection.quantity} {selection.unit}
                          </p>
                        </div>
                        {selection.selectedBatches.length > 0 && (
                          <CheckCircle2 className='h-5 w-5 text-green-500' />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {selection.selectedBatches.length > 0 && (
                        <div>
                          <Label className='text-sm'>Lô đã chọn:</Label>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            {selection.selectedBatches.map((batch) => (
                              <Badge
                                key={batch.batchId}
                                variant='secondary'
                                className='cursor-pointer'
                                onClick={() =>
                                  handleRemoveBatchFromDetail(
                                    selection.orderInvoiceDetailId,
                                    batch.batchId
                                  )
                                }
                              >
                                {batch.batchCode} ({batch.weight})
                                <Trash2 className='ml-1 h-3 w-3' />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            const productId =
                              selectedPhase?.orderInvoiceDetails?.[index]
                                ?.product?.id;
                            if (productId) {
                              loadBatchesGrouped(productId);
                              loadAvailableBatches(productId);
                            }
                          }}
                        >
                          <Package className='mr-2 h-4 w-4' />
                          Xem lô có sẵn
                        </Button>

                        {batchesGrouped.length > 0 &&
                          batchesGrouped.some(
                            (bg) =>
                              bg.product.id ===
                              selectedPhase?.orderInvoiceDetails?.[index]
                                ?.product?.id
                          ) && (
                            <div className='mt-3 space-y-2'>
                              <Label className='text-sm'>Lô hàng có sẵn:</Label>
                              {batchesGrouped
                                .filter(
                                  (bg) =>
                                    bg.product.id ===
                                    selectedPhase?.orderInvoiceDetails?.[index]
                                      ?.product?.id
                                )
                                .map((bg) => (
                                  <div
                                    key={bg.importTicketId}
                                    className='bg-muted rounded-lg p-3'
                                  >
                                    <div className='mb-2 flex items-center justify-between'>
                                      <span className='text-sm font-medium'>
                                        {bg.batchCode}
                                      </span>
                                      <span className='text-muted-foreground text-xs'>
                                        Nhập:{' '}
                                        {bg.importDate
                                          ? new Date(
                                              bg.importDate
                                            ).toLocaleDateString('vi-VN')
                                          : '-'}
                                      </span>
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                      {Object.entries(bg.batch).map(
                                        ([weight, count]) => {
                                          const batchesForWeight =
                                            availableBatches.filter(
                                              (b) =>
                                                b.importTicket?.id ===
                                                  bg.importTicketId &&
                                                `${b.quantity}kg` === weight
                                            );

                                          return (
                                            <div
                                              key={weight}
                                              className='flex flex-col gap-1'
                                            >
                                              <Badge variant='outline'>
                                                <Weight className='mr-1 h-3 w-3' />
                                                {weight}: {count} lô
                                              </Badge>
                                              {batchesForWeight.map((batch) => (
                                                <Button
                                                  key={batch.id}
                                                  size='sm'
                                                  variant='ghost'
                                                  className='h-7 text-xs'
                                                  onClick={() =>
                                                    handleAddBatchToDetail(
                                                      selection.orderInvoiceDetailId,
                                                      batch.id,
                                                      weight,
                                                      bg.batchCode
                                                    )
                                                  }
                                                  disabled={selection.selectedBatches.some(
                                                    (b) =>
                                                      b.batchId === batch.id
                                                  )}
                                                >
                                                  <Plus className='mr-1 h-3 w-3' />
                                                  {batch.id.slice(0, 6)}
                                                </Button>
                                              ))}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetFormData();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !selectedPhase ||
                invoiceDetailSelections.length === 0 ||
                invoiceDetailSelections.some(
                  (sel) => sel.selectedBatches.length === 0
                )
              }
            >
              Tạo phiếu xuất ({getTotalSelectedBatches()} lô)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
