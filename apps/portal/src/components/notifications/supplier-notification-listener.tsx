'use client';
import { useEffect, useState } from 'react';
import { subscribeSupplierNotifications } from '@/services/notifications.service';
import { fetchSupplier } from '@/services/supplier.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export default function SupplierNotificationListener() {
  const [supplierId, setSupplierId] = useState<string>('');
  const { setFullInfo } = useAuth();

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
    const id = supplierId?.trim();
    if (!id) return;
    const unsub = subscribeSupplierNotifications(id, (p) => {
      const title = p.title || 'Thông báo';
      const desc = p.message || '';
      toast(title, { description: desc });
    });
    return () => {
      unsub();
    };
  }, [supplierId]);

  return null;
}
