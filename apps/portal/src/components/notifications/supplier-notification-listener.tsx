'use client';
import { useEffect, useState } from 'react';
import {
  subscribeSupplierNotifications,
  fetchNotifications
} from '@/services/notifications.service';
import { fetchSupplier } from '@/services/supplier.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useNotificationsStore } from '@/stores/notifications.store';

export default function SupplierNotificationListener() {
  const [supplierId, setSupplierId] = useState<string>('');
  const { setFullInfo } = useAuth();
  const addItem = useNotificationsStore((s) => s.addItem);
  const setItems = useNotificationsStore((s) => s.setItems);

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
      const title = p.title || 'Thông báo';
      const desc = p.message || '';
      toast(title, { description: desc });
      const genId = `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      addItem({
        id: p.id ?? genId,
        type: p.type,
        title: p.title ?? 'Thông báo',
        message: p.message ?? '',
        isRead: false,
        createdAt: p.timestamp ?? new Date().toISOString()
      });
    });
    return () => {
      unsub();
    };
  }, [supplierId]);

  return null;
}
