import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from './schema/blog.schema';
import { CaslModule } from '@api/casl/casl.module';
import { RoleModule } from '@api/roles/role.module';
import { NotificationsModule } from '@api/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    CaslModule,
    RoleModule,
    NotificationsModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
