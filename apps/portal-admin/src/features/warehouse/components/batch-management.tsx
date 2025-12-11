'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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
import { useToast } from '@/components/ui/use-toast';
import { fetchAreaById, fetchAreas, updateArea } from '@/services/area.service';
import { fetchBatches } from '@/services/batch.service';
import {
  createImportTicket,
  fetchImportTickets
} from '@/services/import-ticket.service';
import {
  fetchInboundBatchById,
  fetchInboundBatches
} from '@/services/inbound-batch.service';
import type { Area } from '@/types/area';
import type { Batch } from '@/types/batch';
import type { ImportTicket } from '@/types/import-ticket';
import type { InboundBatch } from '@/types/inbound-batch';
import { IconArchive, IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import QualityDetection from './quality-detection';

const BATCH_CAPACITY_KG = 20;

const defaultImportTicketForm = {
  realityQuantity: 0,
  importDate: new Date().toISOString(),
  areaId: ''
};

export function BatchManagement() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [importTickets, setImportTickets] = useState<ImportTicket[]>([]);
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [selectedInboundForDetail, setSelectedInboundForDetail] =
    useState<InboundBatch | null>(null);
  const [selectedTicketForBatches, setSelectedTicketForBatches] =
    useState<ImportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInboundDetailOpen, setIsInboundDetailOpen] = useState(false);
  const [isQualityCheckOpen, setIsQualityCheckOpen] = useState(false);
  const [isTicketBatchesOpen, setIsTicketBatchesOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    importTicketId: '',
    productId: '',
    areaId: ''
  });
  const [importTicketForm, setImportTicketForm] = useState(
    defaultImportTicketForm
  );
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);

  const loadBatches = async (filterParams?: {
    importTicketId?: string;
    productId?: string;
    areaId?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetchBatches({
        page: 1,
        limit: 100,
        ...filterParams
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

  const loadInboundBatches = async () => {
    try {
      const res = await fetchInboundBatches({ page: 1, limit: 100 });
      setInboundBatches(res.data);
    } catch (error) {
      console.error('Unable to load inbound batches', error);
    }
  };

  const loadAreasByWarehouse = async (warehouseIdParam: string) => {
    if (!warehouseIdParam) {
      setAreas([]);
      return;
    }

    setIsLoadingAreas(true);
    try {
      const res = await fetchAreas({
        page: 1,
        limit: 100,
        warehouseId: warehouseIdParam
      });
      setAreas(res.data || []);
    } catch (error) {
      console.error('Unable to load areas', error);
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách khu vực',
        description: error instanceof Error ? error.message : undefined
      });
      setAreas([]);
    } finally {
      setIsLoadingAreas(false);
    }
  };

  useEffect(() => {
    loadBatches();
    loadImportTickets();
    loadInboundBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetImportTicketForm = () => {
    setImportTicketForm(defaultImportTicketForm);
    setAreas([]);
    setWarehouseId(null);
  };

  // Fetch areas khi mở dialog và có selectedInboundForDetail
  useEffect(() => {
    if (isInboundDetailOpen && selectedInboundForDetail?.id) {
      // Fetch lại InboundBatch với full details để có đầy đủ thông tin warehouse
      const loadInboundBatchWithDetails = async () => {
        try {
          const fullInboundBatch = await fetchInboundBatchById(
            selectedInboundForDetail.id
          );

          // Lấy warehouseId từ InboundBatch với full details
          // Ưu tiên: warehouseId trực tiếp -> warehouse.id -> harvestDetail.harvestTicket.harvestScheduleId.supplierId.warehouse.id
          const warehouseIdFromInbound =
            fullInboundBatch.harvestInvoiceDetail?.harvestTicket
              ?.harvestScheduleId?.supplierId?.warehouse?.id;

          if (warehouseIdFromInbound) {
            setWarehouseId(warehouseIdFromInbound);
            await loadAreasByWarehouse(warehouseIdFromInbound);
          } else {
            // Nếu không có warehouseId, hiển thị thông báo
            setAreas([]);
            setWarehouseId(null);
            console.warn(
              'Inbound batch không có thông tin warehouse:',
              fullInboundBatch
            );
            toast({
              variant: 'destructive',
              title: 'Không tìm thấy warehouse',
              description:
                'Inbound batch này không có thông tin warehouse. Vui lòng kiểm tra lại.'
            });
          }
        } catch (error) {
          console.error('Failed to load inbound batch details', error);
          setAreas([]);
          setWarehouseId(null);
          toast({
            variant: 'destructive',
            title: 'Không thể tải thông tin inbound batch',
            description: error instanceof Error ? error.message : undefined
          });
        }
      };

      void loadInboundBatchWithDetails();
    } else {
      setAreas([]);
      setWarehouseId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInboundDetailOpen, selectedInboundForDetail?.id]);

  const handleCreateImportTicket = async () => {
    if (!selectedInboundForDetail?.id) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Inbound Batch'
      });
      return;
    }

    if (
      !importTicketForm.realityQuantity ||
      importTicketForm.realityQuantity <= 0
    ) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng nhập số lượng thực tế lớn hơn 0'
      });
      return;
    }

    if (!importTicketForm.importDate) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn ngày nhập kho'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Nếu chọn area, kiểm tra availableCapacity trước khi tạo
      let availableCapacityCheckOk = true;
      let currentAvailableCapacity = 0;
      if (importTicketForm.areaId) {
        try {
          const currentArea = await fetchAreaById(importTicketForm.areaId);
          currentAvailableCapacity =
            currentArea.availableCapacity ?? currentArea.capacity ?? 0;

          if (importTicketForm.realityQuantity > currentAvailableCapacity) {
            availableCapacityCheckOk = false;
          }
        } catch (areaError) {
          console.error('Failed to check area availableCapacity', areaError);
          toast({
            variant: 'destructive',
            title: 'Không thể kiểm tra sức chứa khu vực',
            description:
              'Vui lòng thử lại sau khi hệ thống lấy được availableCapacity.'
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (!availableCapacityCheckOk) {
        toast({
          variant: 'destructive',
          title: 'Không đủ sức chứa',
          description:
            'Số lượng nhập vượt quá sức chứa khả dụng của khu vực được chọn.'
        });
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        realityQuantity: Number(importTicketForm.realityQuantity),
        inboundBatch: { id: selectedInboundForDetail.id },
        area: { id: importTicketForm.areaId }
      };

      const newTicket = await createImportTicket(payload);

      // Nếu có chọn area, cập nhật availableCapacity của area đó
      if (importTicketForm.areaId) {
        try {
          // Tính số batch sẽ được tạo (mỗi batch 20kg)
          const numberOfBatches = Math.floor(
            importTicketForm.realityQuantity / BATCH_CAPACITY_KG
          );
          const totalWeightInKg = numberOfBatches * BATCH_CAPACITY_KG;

          // Fetch area hiện tại để lấy availableCapacity
          const currentArea = await fetchAreaById(importTicketForm.areaId);
          const currentAvailableCapacity =
            currentArea.availableCapacity ?? currentArea.capacity;

          // Tính availableCapacity mới = availableCapacity hiện tại - số kg đã nhập
          const newAvailableCapacity = Math.max(
            0,
            currentAvailableCapacity - totalWeightInKg
          );

          // Update area với availableCapacity mới
          await updateArea(importTicketForm.areaId, {
            availableCapacity: newAvailableCapacity
          });

          console.log(
            `Updated area ${importTicketForm.areaId}: availableCapacity from ${currentAvailableCapacity} to ${newAvailableCapacity} (subtracted ${totalWeightInKg}kg from ${numberOfBatches} batches)`
          );
        } catch (areaError) {
          console.error('Failed to update area availableCapacity', areaError);
          // Không throw error, chỉ log vì import ticket đã được tạo thành công
          toast({
            variant: 'destructive',
            title: 'Cảnh báo',
            description:
              'Import ticket đã được tạo nhưng không thể cập nhật sức chứa khả dụng của khu vực. Vui lòng kiểm tra lại.'
          });
        }
      }

      setImportTickets((prev) => [newTicket, ...prev]);

      toast({
        title: 'Đã tạo import ticket',
        description: `Ticket ${newTicket.id} đã được tạo thành công`
      });

      resetImportTicketForm();
      setIsInboundDetailOpen(false);
      setSelectedInboundForDetail(null);
      await loadBatches();
      await loadImportTickets();

      // Reload areas để cập nhật availableCapacity trong dropdown
      if (warehouseId) {
        await loadAreasByWarehouse(warehouseId);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo import ticket',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gom các import ticket theo inbound batch để biết inbound nào đã có ticket
  const inboundWithTickets = useMemo(() => {
    const setIds = new Set<string>();
    importTickets.forEach((ticket) => {});
    return setIds;
  }, [importTickets]);

  // Danh sách inbound chưa có import ticket (hiển thị phía trên bảng)
  const inboundWithoutTicket = useMemo(() => {
    return inboundBatches.filter((batch) => !inboundWithTickets.has(batch.id));
  }, [inboundBatches, inboundWithTickets]);

  // Lọc import tickets theo từ khóa tìm kiếm (client-side filter vì API không hỗ trợ search)
  const filteredImportTickets = useMemo(() => {
    if (!filters.search) return importTickets;
    const keyword = filters.search.toLowerCase();
    return importTickets.filter((ticket) => {
      const productName = ticket?.productName ?? '';
      return (
        ticket.id.toLowerCase().includes(keyword) ||
        productName.toLowerCase().includes(keyword)
      );
    });
  }, [filters.search, importTickets]);

  // Effect to reload batches when filters change
  useEffect(() => {
    const { importTicketId, productId, areaId } = filters;
    if (importTicketId || productId || areaId) {
      loadBatches({ importTicketId, productId, areaId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.importTicketId, filters.productId, filters.areaId]);

  // Gom các batch theo import ticket để hiển thị khi xem chi tiết import ticket
  const batchesByImportTicket = useMemo(() => {
    return batches.reduce<Record<string, Batch[]>>((acc, batch) => {
      const id = batch.importTicket?.id;
      if (!id) return acc;
      if (!acc[id]) acc[id] = [];
      acc[id].push(batch);
      return acc;
    }, {});
  }, [batches]);

  // Các batch của import ticket đang xem chi tiết
  const batchesOfSelectedTicket = useMemo(() => {
    if (!selectedTicketForBatches) return [];
    const list = batchesByImportTicket[selectedTicketForBatches.id] ?? [];
    return [...list].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  }, [batchesByImportTicket, selectedTicketForBatches]);

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconArchive className='h-8 w-8 text-emerald-600' />
            Quản lý Import Tickets
          </h1>
        </div>
        {/* <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={loadInboundBatches}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới inbound
          </Button>
          <Button variant='outline' onClick={loadImportTickets}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới import ticket
          </Button>
          <Button variant='outline' onClick={loadBatches}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới batches
          </Button>
        </div> */}
      </div>

      {/* Inbound batches chưa tạo import ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Inbound batches chưa tạo import ticket</CardTitle>
          <CardDescription>
            Những inbound batch này chưa có import ticket. Bấm xem chi tiết để
            tạo import ticket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inboundWithoutTicket.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Tất cả inbound batches đã có import ticket.
                    </TableCell>
                  </TableRow>
                ) : (
                  inboundWithoutTicket.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>
                        {batch.harvestInvoiceDetail.product?.name ||
                          batch.harvestInvoiceDetail.product?.id ||
                          'Không có thông tin sản phẩm'}
                      </TableCell>
                      <TableCell>
                        {batch.quantity} {batch.unit}
                      </TableCell>
                      <TableCell className='space-x-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setIsQualityCheckOpen(true);
                          }}
                        >
                          Quét
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setSelectedInboundForDetail(batch);
                            resetImportTicketForm();
                            setIsInboundDetailOpen(true);
                          }}
                        >
                          Xem chi tiết
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

      {/* Bộ lọc & bảng quản lý import ticket */}
      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Quản lý Import Tickets</CardTitle>
          <div className='flex w-full gap-2 md:w-1/2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo ID ticket, inbound, sản phẩm...'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className='pl-10'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Percent</TableHead>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Số batch</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImportTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Không có import ticket nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredImportTickets.map((ticket) => {
                    const batchesOfTicket =
                      batchesByImportTicket[ticket.id] ?? [];
                    const product = ticket?.productName;

                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className='font-medium'>
                          {ticket.id}
                        </TableCell>
                        <TableCell>{product ?? '—'}</TableCell>
                        <TableCell>
                          {typeof ticket.percent === 'number'
                            ? `${ticket.percent}%`
                            : '—'}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {ticket.importDate
                            ? new Date(ticket.importDate).toLocaleString(
                                'vi-VN'
                              )
                            : '—'}
                        </TableCell>
                        <TableCell>{batchesOfTicket.length}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setSelectedTicketForBatches(ticket);
                              setIsTicketBatchesOpen(true);
                            }}
                          >
                            Xem batches
                          </Button>
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

      {/* Popup chi tiết inbound + tạo import ticket */}
      <Dialog
        open={isInboundDetailOpen}
        onOpenChange={(open) => {
          setIsInboundDetailOpen(open);
          if (!open) {
            setSelectedInboundForDetail(null);
            resetImportTicketForm();
          }
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết Inbound Batch</DialogTitle>
          </DialogHeader>
          {selectedInboundForDetail ? (
            <div className='space-y-4 py-2'>
              <div className='bg-muted/40 grid gap-3 rounded-md border p-3 text-sm md:grid-cols-2'>
                <div>
                  <p className='font-semibold'>Inbound Batch ID</p>
                  <p>{selectedInboundForDetail.id}</p>
                </div>
                <div>
                  <p className='font-semibold'>Sản phẩm</p>
                  <p>
                    {selectedInboundForDetail.harvestInvoiceDetail.product
                      ?.name ||
                      selectedInboundForDetail.harvestInvoiceDetail.product
                        ?.id ||
                      '—'}
                  </p>
                </div>
                <div>
                  <p className='font-semibold'>Số lượng</p>
                  <p>
                    {selectedInboundForDetail.quantity}{' '}
                    {selectedInboundForDetail.unit}
                  </p>
                </div>
              </div>

              <div className='space-y-3 border-t pt-3'>
                <p className='text-sm font-semibold'>
                  Tạo Import Ticket cho inbound batch này
                </p>
                <div className='space-y-2'>
                  <Label htmlFor='realityQuantity'>
                    Số lượng thực tế (kg) *
                  </Label>
                  <Input
                    id='realityQuantity'
                    type='number'
                    min={0}
                    step={0.01}
                    value={importTicketForm.realityQuantity}
                    onChange={(e) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        realityQuantity: Number(e.target.value)
                      }))
                    }
                    placeholder='Nhập số lượng thực tế'
                  />
                  {importTicketForm.realityQuantity > 0 && (
                    <p className='text-muted-foreground text-xs'>
                      Sẽ tạo{' '}
                      {Math.floor(
                        importTicketForm.realityQuantity / BATCH_CAPACITY_KG
                      )}{' '}
                      batch (mỗi batch 20kg)
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='areaId'>Area (tùy chọn)</Label>
                  <Select
                    value={importTicketForm.areaId || undefined}
                    onValueChange={(value) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        areaId: value || ''
                      }))
                    }
                    disabled={isLoadingAreas || !warehouseId}
                  >
                    <SelectTrigger id='areaId'>
                      <SelectValue
                        placeholder={
                          isLoadingAreas
                            ? 'Đang tải danh sách khu vực...'
                            : !warehouseId
                              ? 'Không tìm thấy warehouse'
                              : areas.length === 0
                                ? 'Không có khu vực nào'
                                : 'Chọn khu vực'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name} ({area.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {warehouseId && areas.length === 0 && !isLoadingAreas && (
                    <p className='text-muted-foreground text-xs'>
                      Warehouse này chưa có khu vực nào
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='importDate'>Ngày nhập kho *</Label>
                  <DateTimePicker
                    value={importTicketForm.importDate}
                    onChange={(value: string) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        importDate: value
                      }))
                    }
                  />
                </div>
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsInboundDetailOpen(false)}
                  disabled={isSubmitting}
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleCreateImportTicket}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo Import Ticket'}
                </Button>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              Không tìm thấy thông tin inbound batch.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Popup xem các batches của một import ticket */}
      <Dialog
        open={isTicketBatchesOpen}
        onOpenChange={(open) => {
          setIsTicketBatchesOpen(open);
          if (!open) {
            setSelectedTicketForBatches(null);
          }
        }}
      >
        <DialogContent className='max-h-[95vh] w-[98vw] !max-w-[80vw] space-y-4 overflow-hidden p-6'>
          <DialogHeader>
            <DialogTitle className='text-xl'>
              Batches của import ticket {selectedTicketForBatches?.id ?? ''}
            </DialogTitle>
          </DialogHeader>
          <div className='bg-background w-full overflow-auto rounded-md border p-4 shadow-inner'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[200px]'>ID</TableHead>
                  <TableHead className='min-w-[120px]'>Batch code</TableHead>
                  <TableHead className='min-w-[150px]'>Sản phẩm</TableHead>
                  <TableHead className='min-w-[120px]'>Số lượng</TableHead>
                  <TableHead className='min-w-[150px]'>Khu vực</TableHead>
                  <TableHead className='min-w-[180px]'>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchesOfSelectedTicket.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Import ticket này chưa có batch nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  batchesOfSelectedTicket.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium break-all'>
                        {batch.id}
                      </TableCell>
                      <TableCell className='break-all'>
                        {batch.batchCode ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {batch.product?.name || batch.product?.id || '—'}
                          </div>
                          {batch.product?.name && batch.product?.id && (
                            <div className='text-muted-foreground text-xs'>
                              ID: {batch.product.id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>
                          {batch.quantity} {batch.unit || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {batch.area?.name || batch.area?.id || '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm whitespace-nowrap'>
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
        </DialogContent>
      </Dialog>

      {/* Popup UI Quét */}
      <Dialog
        open={isQualityCheckOpen}
        onOpenChange={(open) => {
          setIsQualityCheckOpen(open);
        }}
      >
        <DialogContent className='max-h-[90vh] !max-w-6xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Kiểm định chất lượng nhập kho</DialogTitle>
          </DialogHeader>
          <QualityDetection />
        </DialogContent>
      </Dialog>
    </div>
  );
}
