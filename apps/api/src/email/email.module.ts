import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from './schema/email-template.schema';
import { CaslModule } from '@api/casl/casl.module';
import { RoleModule } from '@api/roles/role.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
    ]),
    CaslModule,
    RoleModule,
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
