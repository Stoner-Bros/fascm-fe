import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { CaslModule } from '@api/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EventEmitterModule.forRoot(),
    CaslModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, WsJwtAuthGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
