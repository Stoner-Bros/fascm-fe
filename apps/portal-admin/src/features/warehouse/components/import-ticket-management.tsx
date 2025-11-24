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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  IconClipboardList,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTicket
} from '@tabler/icons-react';
import {
  createImportTicket,
  fetchImportTickets
} from '@/services/import-ticket.service';
import { fetchInboundBatches } from '@/services/inbound-batch.service';
import type { ImportTicket, InboundBatch } from '@/types';

const defaultForm = {
  inboundBatch: { id: '' },
  numberOfBatch: 1,
  percent: 100,
  importDate: new Date().toISOString()
};

export function ImportTicketManagement() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ImportTicket[]>([]);
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [form, setForm] = useState(defaultForm);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetchImportTickets({
        page: 1,
        limit: 50,
        search: filters.search || undefined
      });
      setTickets(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách import ticket',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInboundBatches = async () => {
    try {
      const res = await fetchInboundBatches({ page: 1, limit: 100 });
      setInboundBatches(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách inbound batches',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  useEffect(() => {
    loadTickets();
    loadInboundBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => setForm(defaultForm);

  const handleCreate = async () => {
    if (!form.inboundBatch.id) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn inbound batch'
      });
      return;
    }

    if (!form.importDate) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn ngày nhập kho'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        numberOfBatch: Number(form.numberOfBatch),
        percent: Number(form.percent),
        importDate: form.importDate,
        inboundBatch: { id: form.inboundBatch.id }
      };
      const newTicket = await createImportTicket(payload);
      setTickets((prev) => [newTicket, ...prev]);
      toast({
        title: 'Đã tạo import ticket',
        description: `Ticket #${newTicket.id} đã được tạo`
      });
      resetForm();
      setIsDialogOpen(false);
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

  const summary = useMemo(() => {
    if (tickets.length === 0) {
      return { totalTickets: 0, avgPercent: 0 };
    }
    const totalPercent = tickets.reduce(
      (sum, ticket) => sum + ticket.percent,
      0
    );
    return {
      totalTickets: tickets.length,
      avgPercent: Math.round(totalPercent / tickets.length)
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (!filters.search) return tickets;
    const keyword = filters.search.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(keyword) ||
        ticket.inboundBatch?.id?.toLowerCase().includes(keyword)
    );
  }, [tickets, filters.search]);

  const selectedInboundBatch = inboundBatches.find(
    (batch) => batch.id === form.inboundBatch.id
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconTicket className='h-8 w-8 text-blue-600' />
            Import Tickets
          </h1>
          <p className='text-muted-foreground'>
            Tạo phiếu nhập kho dựa trên inbound batches đã hoàn tất.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={loadTickets}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetForm();
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo import ticket
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
              <DialogHeader>
                <DialogTitle>Tạo import ticket</DialogTitle>
                <DialogDescription>
                  Điền thông tin để ghi nhận phiếu nhập kho mới.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='inboundBatch'>Inbound Batch</Label>
                  <Select
                    value={form.inboundBatch.id}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        inboundBatch: { id: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn inbound batch' />
                    </SelectTrigger>
                    <SelectContent>
                      {inboundBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedInboundBatch && (
                  <div className='rounded-md border border-dashed p-3 text-sm'>
                    <p className='font-semibold'>
                      Batch ID: {selectedInboundBatch.id}
                    </p>
                    <p>
                      Sản phẩm:{' '}
                      {selectedInboundBatch.product?.name ||
                        selectedInboundBatch.product?.id ||
                        '—'}
                    </p>
                    <p>
                      Số lượng: {selectedInboundBatch.quantity}{' '}
                      {selectedInboundBatch.unit}
                    </p>
                  </div>
                )}
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='numberOfBatch'>Số batch</Label>
                    <Input
                      id='numberOfBatch'
                      type='number'
                      min={1}
                      value={form.numberOfBatch}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          numberOfBatch: Number(e.target.value)
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='percent'>Tỷ lệ hoàn thành (%)</Label>
                    <Input
                      id='percent'
                      type='number'
                      min={0}
                      max={100}
                      value={form.percent}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          percent: Number(e.target.value)
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='importDate'>Ngày nhập kho</Label>
                  <DateTimePicker
                    value={form.importDate}
                    onChange={(value: string) =>
                      setForm((prev) => ({
                        ...prev,
                        importDate: value
                      }))
                    }
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo ticket'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan import ticket</CardTitle>
          <CardDescription>
            Tình trạng các phiếu nhập gần đây trong kho nông sản.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div>
            <p className='text-muted-foreground text-sm'>Tổng số ticket</p>
            <p className='text-3xl font-semibold'>{summary.totalTickets}</p>
          </div>
          <div>
            <p className='text-muted-foreground text-sm'>Tỷ lệ hoàn thành TB</p>
            <p className='text-3xl font-semibold text-green-600'>
              {summary.avgPercent}%
            </p>
          </div>
          <div className='bg-muted/40 rounded-md border p-3 text-sm'>
            <p className='font-medium'>Ghi chú</p>
            <p className='text-muted-foreground'>
              Mỗi import ticket liên kết với một inbound batch và ghi nhận phần
              trăm đã nhập vào kho.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-1 gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo mã ticket hoặc inbound batch'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className='pl-10'
              />
            </div>
            <Button variant='outline' onClick={loadTickets}>
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách import tickets</CardTitle>
          <CardDescription>Quản lý các phiếu nhập kho đã tạo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Ticket</TableHead>
                  <TableHead>Inbound Batch</TableHead>
                  <TableHead>Số batch</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có import ticket nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className='font-medium'>{ticket.id}</TableCell>
                      <TableCell className='font-medium'>
                        {ticket.inboundBatch?.id ?? '—'}
                      </TableCell>
                      <TableCell>{ticket.numberOfBatch}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{ticket.percent}%</Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.importDate
                          ? new Date(ticket.importDate).toLocaleString('vi-VN')
                          : '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString('vi-VN')
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
