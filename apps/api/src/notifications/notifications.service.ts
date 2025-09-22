import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NOTIFICATION_EVENTS } from './notification.events';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      ...createNotificationDto,
    });
    const savedNotification = await notification.save();

    // Emit event instead of calling gateway directly
    this.eventEmitter.emit(NOTIFICATION_EVENTS.NEW_NOTIFICATION, {
      userId,
      notification: savedNotification,
    });

    return savedNotification;
  }

  async findAllForUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const updatedNotification = await this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true },
    );

    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }

    const unreadCount = await this.countUnread(userId);
    this.eventEmitter.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_UPDATED, {
      userId,
      count: unreadCount,
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async deleteOne(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }
}
