'use client';
import { useEffect, useState } from 'react';
import { subscribeConsigneeNotifications } from '@/services/notifications.service';
import { fetchMyConsignee } from '@/services/consignee.service';
import { toast } from 'sonner';

export default function ConsigneeNotificationListener() {
  const [consigneeId, setConsigneeId] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    fetchMyConsignee().then((c) => {
      if (!mounted) return;
      const id = c?.id ?? '';
      setConsigneeId(id);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const id = consigneeId?.trim();
    if (!id) return;
    const unsub = subscribeConsigneeNotifications(id, (p) => {
      const title = p.title || 'Thông báo';
      const desc = p.message || '';
      toast(title, { description: desc });
    });
    return () => {
      unsub();
    };
  }, [consigneeId]);

  return null;
}
