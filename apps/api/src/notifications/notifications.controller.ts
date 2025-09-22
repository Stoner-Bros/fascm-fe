import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
@ApiSecurity('API-Key-auth')
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  async create(
    @Req() req: any,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const userId = req.user?._id;
    return this.notificationsService.create(userId, createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user?._id;
    return this.notificationsService.findAllForUser(userId, +page, +limit);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?._id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?._id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?._id;
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?._id;
    await this.notificationsService.deleteOne(id, userId);
    return { message: 'Notification deleted successfully' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  async deleteAll(@Req() req: any) {
    const userId = req.user?._id;
    await this.notificationsService.deleteAll(userId);
    return { message: 'All notifications deleted successfully' };
  }
}
