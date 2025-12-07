'use client';
import { useEffect, useState } from 'react';
import {
  subscribeGlobalNotifications,
  subscribeManagerNotifications,
  subscribeStaffNotifications,
  subscribeDeliveryStaffNotifications,
  type NotificationPayload
} from '@/services/notifications.service';
import { useNotificationsStore } from '@/stores/notifications.store';
import { RoleEnum } from '@/constants/enums';
import { fetchMine } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export default function NotificationListener() {
  const addItem = useNotificationsStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const [entityId, setEntityId] = useState<string>('');
  const [subType, setSubType] = useState<
    'global' | 'manager' | 'staff' | 'delivery'
  >('global');

  useEffect(() => {
    const unsubscribe = subscribeGlobalNotifications(
      (p: NotificationPayload) => {
        const id =
          p.id || `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
        addItem({
          id,
          type: p.type,
          title: p.title,
          message: p.message,
          isRead: false,
          createdAt: p.timestamp
        });
      }
    );
    return () => unsubscribe();
  }, [addItem]);

  useEffect(() => {
    const roleName = user?.role?.name as string | undefined;
    if (!roleName) return;
    if (roleName === RoleEnum.MANAGER) {
      setSubType('manager');
      fetchMine(RoleEnum.MANAGER)
        .then((r: any) => setEntityId(String(r?.id ?? '')))
        .catch(() => {});
    } else if (roleName === RoleEnum.STAFF) {
      setSubType('staff');
      fetchMine(RoleEnum.STAFF)
        .then((r: any) => setEntityId(String(r?.id ?? '')))
        .catch(() => {});
    } else if (roleName === RoleEnum.DELIVERY_STAFF) {
      setSubType('delivery');
      fetchMine(RoleEnum.DELIVERY_STAFF)
        .then((r: any) => setEntityId(String(r?.id ?? '')))
        .catch(() => {});
    } else {
      setSubType('global');
    }
  }, [user?.role?.name]);

  useEffect(() => {
    const id = entityId.trim();
    if (!id) return;
    let unsub: (() => void) | null = null;
    const onNotify = (p: NotificationPayload) => {
      const nid =
        p.id || `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      addItem({
        id: nid,
        type: p.type,
        title: p.title,
        message: p.message,
        isRead: false,
        createdAt: p.timestamp
      });
    };
    if (subType === 'manager') {
      unsub = subscribeManagerNotifications(id, onNotify);
    } else if (subType === 'staff') {
      unsub = subscribeStaffNotifications(id, onNotify);
    } else if (subType === 'delivery') {
      unsub = subscribeDeliveryStaffNotifications(id, onNotify);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [entityId, subType, addItem]);

  return null;
}
