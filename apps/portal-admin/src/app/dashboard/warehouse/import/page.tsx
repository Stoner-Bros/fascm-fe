'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
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
import { fetchAreas } from '@/services/area.service';
import {
  createImportTicket,
  deleteImportTicket,
  fetchImportTickets
} from '@/services/import-ticket.service';
import { fetchInboundBatches } from '@/services/inbound-batch.service';
import type { Area } from '@/types/area';
import type { ImportTicket } from '@/types/import-ticket';
import type { InboundBatch } from '@/types/inbound-batch';
import { Calendar, MapPin, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ImportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ImportTicket[]>([]);
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const [formData, setFormData] = useState({
    inboundBatchId: '',
    areaId: '',
    realityQuantity: 0,
    expiredAt: null as string | null,
    numberOfBigBatch: null as number | null,
    numberOfSmallBatch: null as number | null
  });

  const loadTickets = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetchImportTickets({
        page: pageNum,
        limit
      });
      setTickets(response.data);
      setHasMore(response.hasNextPage ?? false);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phiếu nhập kho',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInboundBatches = async () => {
    try {
      const response = await fetchInboundBatches({ page: 1, limit: 100 });
      setInboundBatches(response.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lô hàng',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    loadInboundBatches();
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (
      !formData.inboundBatchId ||
      !formData.areaId ||
      !formData.realityQuantity
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload: any = {
        inboundBatch: { id: formData.inboundBatchId },
        area: { id: formData.areaId },
        realityQuantity: formData.realityQuantity
      };

      // Add optional fields if provided
      if (formData.expiredAt) {
        payload.expiredAt = new Date(formData.expiredAt).toISOString();
      }
      if (formData.numberOfBigBatch !== null && formData.numberOfBigBatch > 0) {
        payload.numberOfBigBatch = formData.numberOfBigBatch;
      }
      if (
        formData.numberOfSmallBatch !== null &&
        formData.numberOfSmallBatch > 0
      ) {
        payload.numberOfSmallBatch = formData.numberOfSmallBatch;
      }

      await createImportTicket(payload);

      toast({
        title: 'Thành công',
        description: 'Tạo phiếu nhập kho thành công'
      });

      setIsCreateDialogOpen(false);
      setFormData({
        inboundBatchId: '',
        areaId: '',
        realityQuantity: 0,
        expiredAt: null,
        numberOfBigBatch: null,
        numberOfSmallBatch: null
      });
      loadTickets(page);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể tạo phiếu nhập kho',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu nhập kho này?')) return;

    try {
      await deleteImportTicket(id);
      toast({
        title: 'Thành công',
        description: 'Xóa phiếu nhập kho thành công'
      });
      loadTickets(page);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phiếu nhập kho',
        variant: 'destructive'
      });
    }
  };

  const selectedBatch = inboundBatches.find(
    (b) => b.id === formData.inboundBatchId
  );

  return (
    <PageContainer>
      <div className='mx-auto w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Phiếu nhập kho</h1>
            <p className='text-muted-foreground mt-1'>
              Quản lý các phiếu nhập hàng vào kho
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Tạo phiếu nhập
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách phiếu nhập kho</CardTitle>
            <CardDescription>
              Hiển thị tất cả phiếu nhập hàng vào kho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Lô hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Số lô</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Hạn sử dụng</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className='py-8 text-center'>
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : tickets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className='text-muted-foreground py-8 text-center'
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className='text-sm'>
                          {ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {ticket.inboundBatch?.batchCode || '-'}
                            </span>
                            <span className='text-muted-foreground text-sm'>
                              {ticket.inboundBatch?.quantity}{' '}
                              {ticket.inboundBatch?.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Package className='text-muted-foreground h-4 w-4' />
                            <span>
                              {ticket.inboundBatch?.product?.name || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {ticket.realityQuantity} {ticket.inboundBatch?.unit}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1 text-sm'>
                            {ticket.numberOfBigBatch !== null &&
                              ticket.numberOfBigBatch !== undefined && (
                                <span className='text-muted-foreground'>
                                  Lớn: {ticket.numberOfBigBatch}
                                </span>
                              )}
                            {ticket.numberOfSmallBatch !== null &&
                              ticket.numberOfSmallBatch !== undefined && (
                                <span className='text-muted-foreground'>
                                  Nhỏ: {ticket.numberOfSmallBatch}
                                </span>
                              )}
                            {(ticket.numberOfBigBatch === null ||
                              ticket.numberOfBigBatch === undefined) &&
                              (ticket.numberOfSmallBatch === null ||
                                ticket.numberOfSmallBatch === undefined) && (
                                <span className='text-muted-foreground'>-</span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <MapPin className='text-muted-foreground h-4 w-4' />
                            <span>{ticket.area?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Calendar className='text-muted-foreground h-4 w-4' />
                            <span>
                              {new Date(ticket.importDate).toLocaleDateString(
                                'vi-VN'
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.expiredAt ? (
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-orange-500' />
                              <span className='text-sm'>
                                {new Date(ticket.expiredAt).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
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

            {/* Pagination */}
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Tạo phiếu nhập kho</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo phiếu nhập hàng vào kho
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='inboundBatch'>Lô hàng *</Label>
                <Select
                  value={formData.inboundBatchId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, inboundBatchId: value })
                  }
                >
                  <SelectTrigger id='inboundBatch'>
                    <SelectValue placeholder='Chọn lô hàng...' />
                  </SelectTrigger>
                  <SelectContent>
                    {inboundBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batchCode} - {batch.product?.name} (
                        {batch.quantity} {batch.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBatch && (
                <div className='bg-muted rounded-lg p-4'>
                  <h4 className='mb-2 font-semibold'>Thông tin lô hàng</h4>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Sản phẩm:</span>{' '}
                      <span className='font-medium'>
                        {selectedBatch.product?.name}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Số lượng:</span>{' '}
                      <span className='font-medium'>
                        {selectedBatch.quantity} {selectedBatch.unit}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Mã lô:</span>{' '}
                      <span className='font-medium'>
                        {selectedBatch.batchCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor='area'>Khu vực lưu trữ *</Label>
                <Select
                  value={formData.areaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, areaId: value })
                  }
                >
                  <SelectTrigger id='area'>
                    <SelectValue placeholder='Chọn khu vực...' />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='realityQuantity'>Số lượng thực tế *</Label>
                <Input
                  id='realityQuantity'
                  type='number'
                  min={0}
                  step='0.01'
                  value={formData.realityQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realityQuantity: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder='Nhập số lượng thực tế nhập kho'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='numberOfBigBatch'>Số lô lớn</Label>
                  <Input
                    id='numberOfBigBatch'
                    type='number'
                    min={0}
                    value={formData.numberOfBigBatch ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfBigBatch: e.target.value
                          ? parseInt(e.target.value)
                          : null
                      })
                    }
                    placeholder='Số lượng lô lớn'
                  />
                </div>

                <div>
                  <Label htmlFor='numberOfSmallBatch'>Số lô nhỏ</Label>
                  <Input
                    id='numberOfSmallBatch'
                    type='number'
                    min={0}
                    value={formData.numberOfSmallBatch ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfSmallBatch: e.target.value
                          ? parseInt(e.target.value)
                          : null
                      })
                    }
                    placeholder='Số lượng lô nhỏ'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='expiredAt'>Ngày hết hạn</Label>
                <Input
                  id='expiredAt'
                  type='datetime-local'
                  value={formData.expiredAt ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiredAt: e.target.value || null
                    })
                  }
                />
                <p className='text-muted-foreground mt-1 text-sm'>
                  Để trống nếu không có ngày hết hạn
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({
                    inboundBatchId: '',
                    areaId: '',
                    realityQuantity: 0,
                    expiredAt: '',
                    numberOfBigBatch: 0,
                    numberOfSmallBatch: 0
                  });
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleCreate}>Tạo phiếu nhập</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
