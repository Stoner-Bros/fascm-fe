'use client';
import { useEffect, useState } from 'react';
import {
  subscribeSupplierNotifications,
  fetchNotifications
} from '@/services/notifications.service';
import { fetchSupplier } from '@/services/supplier.service';
import { useAuth } from '@/hooks/use-auth';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useTranslations } from 'next-intl';

export default function SupplierNotificationListener() {
  const [supplierId, setSupplierId] = useState<string>('');
  const { setFullInfo } = useAuth();
  const addItem = useNotificationsStore((s) => s.addItem);
  const setItems = useNotificationsStore((s) => s.setItems);
  const t = useTranslations('Notifications');

  useEffect(() => {
    let mounted = true;
    fetchSupplier()
      .then((s) => {
        if (!mounted) return;
        setSupplierId(s?.id ?? '');
        setFullInfo(s);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Preload notifications without clicking the bell
    (async () => {
      try {
        const res = await fetchNotifications({ page: 1, limit: 10 });
        setItems(res.data || []);
      } catch (_) {}
    })();
  }, [setItems]);

  useEffect(() => {
    const id = supplierId?.trim();
    if (!id) return;
    const unsub = subscribeSupplierNotifications(id, (p) => {
      let parsed: any = null;
      if (typeof p.data === 'string') {
        try {
          parsed = JSON.parse(p.data);
        } catch {}
      } else {
        parsed = p.data ?? null;
      }
      const orderScheduleId = parsed?.orderScheduleId ?? '';
      const harvestScheduleId = parsed?.harvestScheduleId ?? '';
      const title = t(p.title ?? 'defaultTitle');
      const desc = t(p.message ?? 'defaultMessage', {
        orderScheduleId,
        harvestScheduleId
      });
      const genId = `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item = {
        id: p.id ?? genId,
        type: p.type,
        title,
        message: desc,
        isRead: false,
        createdAt: p.timestamp ?? new Date().toISOString()
      };
      addItem(item);
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(
            new CustomEvent('notifications:new', { detail: item })
          );
        } catch {}
      }
    });
    return () => {
      unsub();
    };
  }, [supplierId]);

  return null;
}
