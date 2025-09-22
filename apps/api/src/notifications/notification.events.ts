import { Notification } from './schemas/notification.schema';

export interface NotificationEvent {
  userId: string;
  notification: Notification;
}

export const NOTIFICATION_EVENTS = {
  NEW_NOTIFICATION: 'new.notification',
  UNREAD_COUNT_UPDATED: 'unread.count.updated',
} as const;
