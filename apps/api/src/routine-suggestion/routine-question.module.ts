import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutineQuestionService } from './routine-question.service';
import { RoutineQuestionController } from './routine-question.controller';
import {
  RoutineQuestion,
  RoutineQuestionSchema,
} from './schema/routine-question.schema';
import { CaslModule } from '@api/casl/casl.module';
import { OpenAiModule } from '@api/openai/openai.module';
import { UsersModule } from '@api/users/users.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoutineQuestion.name, schema: RoutineQuestionSchema },
    ]),
    CaslModule,
    OpenAiModule,
    UsersModule,
  ],
  controllers: [RoutineQuestionController],
  providers: [RoutineQuestionService],
  exports: [RoutineQuestionService],
})
export class RoutineQuestionModule {}
