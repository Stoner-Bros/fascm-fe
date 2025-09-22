import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { NOTIFICATION_EVENTS, NotificationEvent } from './notification.events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(WsJwtAuthGuard)
  async handleConnection(client: Socket) {
    const userId = client.data.user._id;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.push(client.id);
    }

    // Send unread notifications count
    const count = await this.notificationsService.countUnread(userId);
    client.emit('unreadCount', count);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?._id;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const index = sockets.indexOf(client.id);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @OnEvent(NOTIFICATION_EVENTS.NEW_NOTIFICATION)
  handleNewNotification(payload: NotificationEvent) {
    const sockets = this.userSockets.get(payload.userId.toString()) || [];
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('notification', payload.notification);
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.UNREAD_COUNT_UPDATED)
  handleUnreadCountUpdated(payload: { userId: string; count: number }) {
    const sockets = this.userSockets.get(payload.userId.toString()) || [];
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('unreadCount', payload.count);
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, notificationId: string) {
    const userId = client.data.user._id;
    await this.notificationsService.markAsRead(notificationId, userId);
  }
}
