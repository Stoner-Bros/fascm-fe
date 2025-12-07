import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconBellRinging } from '@tabler/icons-react';
import {
  fetchNotifications,
  markNotificationRead,
  type NotificationItem
} from '@/services/notifications.service';
import { format } from 'date-fns';
import { useNotificationsStore } from '@/stores/notifications.store';

export default function CtaNotify() {
  const [open, setOpen] = useState(false);
  const items = useNotificationsStore((s) => s.items);
  const setItemsStore = useNotificationsStore((s) => s.setItems);
  const markReadStore = useNotificationsStore((s) => s.markRead);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await fetchNotifications({ page: nextPage, limit: 10 });
      setItemsStore(nextPage === 1 ? res.data : [...items, ...res.data]);
      setHasNextPage(res.hasNextPage);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && items.length === 0) {
      await load(1);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const el = rootRef.current;
      if (el && e.target instanceof Element && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const markRead = async (id: string) => {
    if (id.startsWith('tmp_')) {
      markReadStore(id);
      return;
    }
    await markNotificationRead(id);
    markReadStore(id);
  };
  return (
    <div ref={rootRef} className='relative'>
      <Button
        onClick={handleToggle}
        className='dark:hover:bg-foreground/90 dark:hover:text-background text-foreground hover:bg-foreground/90 hover:text-background relative hidden bg-white sm:flex dark:text-black'
      >
        <IconBellRinging />
        {unreadCount > 0 && (
          <span className='absolute right-0 bottom-0 flex size-4 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className='border-border bg-card text-card-foreground absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border shadow-lg'>
          <div className='flex items-center justify-between px-3 py-2'>
            <span className='text-sm font-medium'>Thông báo</span>
            {loading && (
              <span className='text-muted-foreground text-xs'>Đang tải…</span>
            )}
          </div>
          <div className='max-h-80 overflow-auto'>
            {items.length === 0 && !loading ? (
              <div className='text-muted-foreground px-3 py-8 text-center text-sm'>
                Không có thông báo
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className='hover:bg-muted/50 flex items-start gap-2 px-3 py-2'
                >
                  <div
                    className={`mt-1 size-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-red-500'}`}
                  ></div>
                  <div className='flex-1'>
                    <div
                      className={`text-sm font-medium ${n.type === 'system' ? 'text-red-500' : 'text-foreground'}`}
                    >
                      {n.title || 'Thông báo'}
                    </div>
                    {n.message && (
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {n.message}
                      </div>
                    )}
                    <div className='text-muted-foreground mt-1 text-[11px]'>
                      {n.createdAt
                        ? format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm:ss')
                        : ''}
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => markRead(n.id)}
                    >
                      Đã đọc
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className='flex items-center justify-between px-3 py-2'>
            <Button
              variant='ghost'
              size='sm'
              disabled={!hasNextPage || loading}
              onClick={() => load(page + 1)}
            >
              Tải thêm
            </Button>
            <Button variant='ghost' size='sm' onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
