import { io, Socket } from 'socket.io-client';
import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';

function connectNotifications(): Socket {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return io(base + '/notifications', {
    path: '/socket.io',
    transports: ['websocket']
  });
}

export type NotificationPayload = {
  id?: string;
  type: string;
  title?: string;
  message?: string;
  data?: any;
  timestamp?: string;
};

export type NotificationItem = {
  id: string;
  user?: { id?: string } | null;
  deletedAt?: string | null;
  isRead?: boolean | null;
  type?: string | null;
  message?: string | null;
  title?: string | null;
  createdAt?: string;
};

export async function fetchNotifications({
  page = 1,
  limit = 10
}: {
  page?: number;
  limit?: number;
} = {}): Promise<InfinityPaginationResponse<NotificationItem>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<NotificationItem>>(
    `/notifications?${params.toString()}`
  );
}

export async function markNotificationRead(
  id: string
): Promise<NotificationItem> {
  return fetchJSON<NotificationItem>(`/notifications/${id}`, {
    method: 'PATCH',
    body: { isRead: true }
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await fetchJSON<void>(`/notifications/${id}`, { method: 'DELETE' });
}

export function subscribeConsigneeNotifications(
  consigneeId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeConsignee', { consigneeId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeSupplierNotifications(
  supplierId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeSupplier', { supplierId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeGlobalNotifications(
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeManagerNotifications(
  managerId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeManager', { managerId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeStaffNotifications(
  staffId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeStaff', { staffId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeDeliveryStaffNotifications(
  deliveryStaffId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeDeliveryStaff', { deliveryStaffId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}

export function subscribeWarehouseNotifications(
  warehouseId: string,
  onNotify: (p: NotificationPayload) => void
): () => void {
  const socket = connectNotifications();
  const handler = (p: any) => {
    if (p && typeof p === 'object' && typeof p.type === 'string') {
      onNotify(p as NotificationPayload);
    }
  };
  socket.emit('notify:subscribeWarehouse', { warehouseId });
  socket.on('notify', handler);
  return () => {
    socket.off('notify', handler);
    socket.disconnect();
  };
}
