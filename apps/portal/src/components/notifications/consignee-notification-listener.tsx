'use client';
import { useEffect, useState } from 'react';
import { subscribeConsigneeNotifications } from '@/services/notifications.service';
import { fetchMyConsignee } from '@/services/consignee.service';
import { toast } from 'sonner';
import useAuth from '@/hooks/use-auth';

export default function ConsigneeNotificationListener() {
  const [consigneeId, setConsigneeId] = useState<string>('');
  const { setFullInfo } = useAuth();

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
