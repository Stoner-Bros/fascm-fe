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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { fetchOrders } from '@/services/order.service';
import { updateOrderSchedule } from '@/services/order-schedule.service';
import type { OrderBE, OrderScheduleStatus } from '@/types/order';

// Chỉ hiển thị hai hành động chính: Duyệt và Từ chối

function badgeForSchedule(status?: OrderScheduleStatus | null) {
  switch (status) {
    case 'pending':
      return (
        <span className='rounded bg-violet-100 px-2 py-1 text-xs text-violet-700'>
          Đang xử lý
        </span>
      );
    case 'approved':
      return (
        <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-700'>
          Đã duyệt
        </span>
      );
    case 'preparing':
      return (
        <span className='rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700'>
          Chờ phân công
        </span>
      );
    case 'delivering':
      return (
        <span className='rounded bg-amber-100 px-2 py-1 text-xs text-amber-700'>
          Chờ lấy hàng
        </span>
      );
    case 'rejected':
      return (
        <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-700'>
          Từ chối
        </span>
      );
    case 'canceled':
      return (
        <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-700'>
          Đã hủy
        </span>
      );
    default:
      return (
        <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-700'>
          -
        </span>
      );
  }
}

export default function OrderTable() {
  const [rows, setRows] = useState<OrderBE[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchOrders({ page: 1, limit: 20 })
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);

  const doUpdate = async (order: OrderBE, nextStatus: OrderScheduleStatus) => {
    if (!order.orderSchedule?.id) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderSchedule(order.orderSchedule.id, {
        status: nextStatus
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === order.id
            ? {
                ...r,
                orderSchedule: { ...r.orderSchedule!, status: updated.status }
              }
            : r
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Ngày giao</TableHead>
            <TableHead>Trạng thái lịch</TableHead>
            <TableHead className='text-right'>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>Đang tải...</TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>Không có dữ liệu</TableCell>
            </TableRow>
          ) : (
            rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.id}</TableCell>
                <TableCell>
                  {o.orderSchedule?.consignee?.organizationName ?? '-'}
                </TableCell>
                <TableCell>
                  {new Date(o.createdAt).toLocaleString('vi-VN')}
                </TableCell>
                <TableCell>
                  {o.orderSchedule?.orderDate
                    ? new Date(o.orderSchedule.orderDate).toLocaleString(
                        'vi-VN'
                      )
                    : '-'}
                </TableCell>
                <TableCell>
                  {badgeForSchedule(o.orderSchedule?.status ?? null)}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    {o.orderSchedule?.status !== 'approved' &&
                      o.orderSchedule?.status !== 'rejected' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={updatingId === o.id}
                            >
                              Cập nhật
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='end'
                            className='min-w-[180px]'
                          >
                            <DropdownMenuItem
                              onClick={() => doUpdate(o, 'approved')}
                            >
                              Duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => doUpdate(o, 'rejected')}
                            >
                              Từ chối
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    <Button asChild size='sm' variant='outline'>
                      <Link href={`/dashboard/order/${o.id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
