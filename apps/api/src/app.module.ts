import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ApiKeyModule } from './api-keys/api-key.module';
import { CaslModule } from './casl/casl.module';
import { RoleModule } from './roles/role.module';
import { PermissionModule } from './permissions/permissions.module';
import { OpenAiModule } from './openai/openai.module';
import { FilesModule } from './files/files.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { EmailModule } from './email/email.module';
import { ProductsModule } from './products/products.module';
import { SkinProfileModule } from './skin-profile/skin-profile.module';
import { BlogModule } from './blog/blog.module';
import { RoutineQuestionModule } from './routine-suggestion/routine-question.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SePayModule } from './sepay/sepay.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PayosModule } from './payos/payos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
    ApiKeyModule,
    AuthModule,
    UsersModule,
    CaslModule,
    RoleModule,
    PermissionModule,
    OpenAiModule,
    FilesModule,
    EmailModule,
    ProductsModule,
    SkinProfileModule,
    BlogModule,
    RoutineQuestionModule,
    NotificationsModule,
    SePayModule,
    SubscriptionModule,
    PayosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
