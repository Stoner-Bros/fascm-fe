import { io, Socket } from 'socket.io-client';

function connectNotifications(): Socket {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return io(base + '/notifications', { transports: ['websocket'] });
}

export type NotificationPayload = {
  type: string;
  title?: string;
  message?: string;
  data?: any;
  timestamp?: string;
};

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
