'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  subscribeConsigneeNotifications,
  fetchNotifications
} from '@/services/notifications.service';
import { fetchMyConsignee } from '@/services/consignee.service';
import { toast } from 'sonner';
import useAuth from '@/hooks/use-auth';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useTranslations } from 'next-intl';

export default function ConsigneeNotificationListener() {
  const [consigneeId, setConsigneeId] = useState<string>('');
  const { setFullInfo } = useAuth();
  const addItem = useNotificationsStore((s) => s.addItem);
  const setItems = useNotificationsStore((s) => s.setItems);
  const t = useTranslations('Notifications');

  useEffect(() => {
    let mounted = true;
    fetchMyConsignee().then((c) => {
      if (!mounted) return;
      const id = c?.id ?? '';
      setConsigneeId(id);
      setFullInfo(c);
    });
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
    const id = consigneeId?.trim();
    if (!id) return;
    const unsub = subscribeConsigneeNotifications(id, (p) => {
      let parsed: any = null;
      if (typeof p.data === 'string') {
        try {
          parsed = JSON.parse(p.data);
        } catch {}
      } else {
        parsed = p.data ?? null;
      }
      const orderScheduleId = parsed?.orderScheduleId ?? '';
      const title = t(p.title ?? 'defaultTitle');
      const desc = t(p.message ?? 'defaultMessage', { orderScheduleId });
      toast(title, { description: desc });
      const genId = `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      addItem({
        id: p.id ?? genId,
        type: p.type,
        title,
        message: desc,
        isRead: false,
        createdAt: p.timestamp ?? new Date().toISOString()
      });
    });
    return () => {
      unsub();
    };
  }, [consigneeId]);

  return null;
}
