'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchDeliveries } from '@/services/delivery.service';
import { Delivery } from '@/types';

type LatLng = { lat: number; lng: number };

export default function DeliveryRealtimeAdminPage() {
  const [list, setList] = useState<Delivery[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [pageList, setPageList] = useState(1);
  const [hasNextList, setHasNextList] = useState(false);

  useEffect(() => {
    setLoadingList(true);
    fetchDeliveries({ page: pageList, limit: 10 })
      .then((res) => {
        setList(res.data);
        setHasNextList(res.hasNextPage);
      })
      .finally(() => setLoadingList(false));
  }, [pageList]);

  return (
    <div className='space-y-4 p-4'>
      <div className='rounded-md border p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-lg font-semibold'>Danh sách Delivery</div>
          <div className='flex gap-2'>
            <button
              className='rounded border px-3 py-2'
              disabled={loadingList || pageList <= 1}
              onClick={() => setPageList((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </button>
            <button
              className='rounded border px-3 py-2'
              disabled={loadingList || !hasNextList}
              onClick={() => setPageList((p) => p + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
        <div className='rounded-md border'>
          <table className='w-full text-sm'>
            <thead>
              <tr>
                <th className='border-b p-2 text-left'>ID</th>
                <th className='border-b p-2 text-left'>Order Schedule</th>
                <th className='border-b p-2 text-left'>Harvest Schedule</th>
                <th className='border-b p-2 text-left'>Trạng thái</th>
                <th className='border-b p-2 text-left'>Bắt đầu</th>
                <th className='border-b p-2 text-left'>Kết thúc</th>
                <th className='border-b p-2 text-right'>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td className='border-b p-2'>{d.id}</td>
                  <td className='border-b p-2'>{d.orderSchedule?.id ?? '-'}</td>
                  <td className='border-b p-2'>
                    {d.harvestSchedule?.id ?? '-'}
                  </td>
                  <td className='border-b p-2'>{d.status ?? '-'}</td>
                  <td className='border-b p-2'>{d.startTime ?? '-'}</td>
                  <td className='border-b p-2'>{d.endTime ?? '-'}</td>
                  <td className='border-b p-2 text-right'>
                    <Link
                      className='rounded border px-3 py-1'
                      href={`/dashboard/delivery/realtime/${d.id}`}
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
