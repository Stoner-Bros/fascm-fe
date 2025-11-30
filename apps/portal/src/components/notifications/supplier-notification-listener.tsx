'use client';
import { useEffect, useState } from 'react';
import { subscribeSupplierNotifications } from '@/services/notifications.service';
import { fetchMySupplier } from '@/services/supplier.service';
import { toast } from 'sonner';

export default function SupplierNotificationListener() {
  const [supplierId, setSupplierId] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    fetchMySupplier()
      .then((s) => {
        if (!mounted) return;
        setSupplierId(s?.id ?? '');
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
