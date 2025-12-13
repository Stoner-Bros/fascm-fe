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
import { useTranslations } from 'next-intl';

export default function CtaNotify() {
  const [open, setOpen] = useState(false);
  const items = useNotificationsStore((s) => s.items);
  const setItemsStore = useNotificationsStore((s) => s.setItems);
  const markReadStore = useNotificationsStore((s) => s.markRead);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tUi = useTranslations('Notifications.ui');
  const tNoti = useTranslations('Notifications');

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
            <span className='text-sm font-medium'>{tUi('title')}</span>
            {loading && (
              <span className='text-muted-foreground text-xs'>
                {tUi('loading')}
              </span>
            )}
          </div>
          <div className='max-h-80 overflow-auto'>
            {items.length === 0 && !loading ? (
              <div className='text-muted-foreground px-3 py-8 text-center text-sm'>
                {tUi('empty')}
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
                      {(() => {
                        const typeMap: Record<string, string> = {
                          'order-approved': 'orderScheduleApproved',
                          'order-completed': 'orderScheduleCompleted',
                          'order-canceled': 'orderScheduleCanceled',
                          'order-rejected': 'orderScheduleRejected',
                          'harvest-approved': 'harvestScheduleApproved'
                        };
                        const keyFromType = typeMap[String(n.type || '')];
                        if (keyFromType) {
                          try {
                            return tNoti(keyFromType);
                          } catch {}
                        }
                        const looksLikeKey =
                          typeof n.title === 'string' &&
                          /^[A-Za-z0-9_.-]+$/.test(n.title);
                        if (looksLikeKey) {
                          try {
                            const raw = n.title || 'defaultTitle';
                            const sanitized = raw.startsWith('Notifications.')
                              ? raw.slice('Notifications.'.length)
                              : raw;
                            return tNoti(sanitized);
                          } catch {}
                        }
                        return n.title || tNoti('defaultTitle');
                      })()}
                    </div>
                    {n.message && (
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {(() => {
                          let vars: any = {};
                          if (typeof (n as any).data === 'string') {
                            try {
                              const parsed = JSON.parse((n as any).data);
                              vars.orderScheduleId =
                                parsed?.orderScheduleId ?? '';
                              vars.harvestScheduleId =
                                parsed?.harvestScheduleId ?? '';
                            } catch {
                              vars.orderScheduleId = '';
                              vars.harvestScheduleId = '';
                            }
                          } else if (
                            n &&
                            typeof (n as any).data === 'object' &&
                            (n as any).data !== null
                          ) {
                            vars.orderScheduleId =
                              (n as any).data.orderScheduleId ?? '';
                            vars.harvestScheduleId =
                              (n as any).data.harvestScheduleId ?? '';
                          } else {
                            vars.orderScheduleId = '';
                            vars.harvestScheduleId = '';
                          }
                          const msgMap: Record<string, string> = {
                            'order-approved': 'orderScheduleHasBeenApproved',
                            'order-completed': 'orderScheduleHasBeenCompleted',
                            'order-canceled': 'orderScheduleHasBeenCanceled',
                            'order-rejected': 'orderScheduleHasBeenRejected',
                            'harvest-approved': 'harvestScheduleHasBeenApproved'
                          };
                          const keyFromType = msgMap[String(n.type || '')];
                          if (keyFromType) {
                            try {
                              return tNoti(keyFromType, vars);
                            } catch {
                              const titleFallback: Record<string, string> = {
                                'order-approved': 'orderScheduleApproved',
                                'order-completed': 'orderScheduleCompleted',
                                'order-canceled': 'orderScheduleCanceled',
                                'order-rejected': 'orderScheduleRejected'
                              };
                              const tf = titleFallback[String(n.type || '')];
                              if (tf) {
                                try {
                                  return tNoti(tf);
                                } catch {}
                              }
                            }
                          }
                          const looksLikeKey =
                            typeof n.message === 'string' &&
                            /^[A-Za-z0-9_.-]+$/.test(n.message);
                          if (looksLikeKey) {
                            try {
                              const raw = n.message || 'defaultMessage';
                              const sanitized = raw.startsWith('Notifications.')
                                ? raw.slice('Notifications.'.length)
                                : raw;
                              return tNoti(sanitized, vars);
                            } catch {
                              const baseFallbackMap: Record<string, string> = {
                                orderScheduleHasBeenApproved:
                                  'orderScheduleApproved',
                                orderScheduleHasBeenCompleted:
                                  'orderScheduleCompleted',
                                orderScheduleHasBeenCanceled:
                                  'orderScheduleCanceled',
                                orderScheduleHasBeenRejected:
                                  'orderScheduleRejected',
                                harvestScheduleHasBeenApproved:
                                  'harvestScheduleApproved'
                              };
                              const raw = n.message || '';
                              const sanitized = raw.startsWith('Notifications.')
                                ? raw.slice('Notifications.'.length)
                                : raw;
                              const bf = baseFallbackMap[sanitized];
                              if (bf) {
                                try {
                                  return tNoti(bf);
                                } catch {}
                              }
                            }
                          }
                          return n.message;
                        })()}
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
                      {tUi('markRead')}
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
              {tUi('loadMore')}
            </Button>
            <Button variant='ghost' size='sm' onClick={() => setOpen(false)}>
              {tUi('close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
