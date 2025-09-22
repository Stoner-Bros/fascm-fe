import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkinProfileController } from './skin-profile.controller';
import { SkinProfileService } from './skin-profile.service';
import {
  SkinQuestion,
  SkinQuestionSchema,
} from './schema/skin-question.schema';
import { SkinProfile, SkinProfileSchema } from './schema/skin-profile.schema';
import { CaslModule } from '@api/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkinQuestion.name, schema: SkinQuestionSchema },
      { name: SkinProfile.name, schema: SkinProfileSchema },
    ]),
    CaslModule,
  ],
  controllers: [SkinProfileController],
  providers: [SkinProfileService],
  exports: [SkinProfileService],
})
export class SkinProfileModule {}
