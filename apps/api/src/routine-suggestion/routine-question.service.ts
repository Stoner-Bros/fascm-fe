import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoutineQuestionDto } from './dto/create-routine-question.dto';
import { UpdateRoutineQuestionDto } from './dto/update-routine-question.dto';
import { RoutineQuestion } from './schema/routine-question.schema';
import {
  PaginationParams,
  PaginatedResult,
} from '@api/skin-profile/skin-profile.service';
import { CreateRoutineAnswersDto } from './dto/create-routine-answers.dto';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class RoutineQuestionService {
  constructor(
    @InjectModel(RoutineQuestion.name)
    private routineQuestionModel: Model<RoutineQuestion>,
    private openAiService: OpenAiService,
  ) {}

  async create(
    createRoutineQuestionDto: CreateRoutineQuestionDto,
  ): Promise<RoutineQuestion> {
    const createdQuestion = new this.routineQuestionModel(
      createRoutineQuestionDto,
    );
    return createdQuestion.save();
  }

  async findAll(
    paginationParams: PaginationParams,
  ): Promise<PaginatedResult<RoutineQuestion>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc',
    } = paginationParams;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [questions, total] = await Promise.all([
      this.routineQuestionModel
        .find({ isActive: true })
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.routineQuestionModel.countDocuments({ isActive: true }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: questions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<RoutineQuestion> {
    const question = await this.routineQuestionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Routine question with ID ${id} not found`);
    }
    return question;
  }

  async update(
    id: string,
    updateRoutineQuestionDto: UpdateRoutineQuestionDto,
  ): Promise<RoutineQuestion> {
    const updatedQuestion = await this.routineQuestionModel
      .findByIdAndUpdate(id, updateRoutineQuestionDto, { new: true })
      .exec();
    if (!updatedQuestion) {
      throw new NotFoundException(`Routine question with ID ${id} not found`);
    }
    return updatedQuestion;
  }

  async remove(id: string): Promise<RoutineQuestion> {
    const deletedQuestion = await this.routineQuestionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedQuestion) {
      throw new NotFoundException(`Routine question with ID ${id} not found`);
    }
    return deletedQuestion;
  }

  async getSuggestions(userId: number, answersDto: CreateRoutineAnswersDto) {
    // Lấy thông tin chi tiết của các câu hỏi
    const questionDetails = await Promise.all(
      answersDto.answers.map(async (answer) => {
        const question = await this.findOne(answer.questionId);
        return {
          question: question.question,
          type: question.type,
          answers: answer.answers.map((ans) => {
            const option = question.options.find((opt) => opt.value === ans);
            return {
              value: ans,
              label: option?.label || ans,
              description: option?.description,
            };
          }),
        };
      }),
    );

    // Tạo thread mới
    const thread = await this.openAiService.createThread(userId);

    // Tạo prompt cho AI
    const prompt = `Tôi cần gợi ý một chu trình chăm sóc da dựa trên các câu trả lời sau:

${questionDetails
  .map(
    (q) => `
Câu hỏi: ${q.question}
Trả lời: ${q.answers.map((a) => `${a.label}${a.description ? ` (${a.description})` : ''}`).join(', ')}
`,
  )
  .join('\n')}

Vui lòng gợi ý một chu trình chăm sóc da phù hợp với thông tin trên, bao gồm:
1. Các bước cần thực hiện
2. Thứ tự thực hiện các bước
3. Tần suất thực hiện (sáng/tối)
4. Các lưu ý quan trọng khi thực hiện
5. Giải thích tại sao chu trình này phù hợp với người dùng

Hãy trình bày chi tiết và dễ hiểu.`;

    // Gửi prompt tới AI và trả về response stream
    return {
      threadId: thread._id,
      responseStream: await this.openAiService.sendMessageToThread(
        thread.id.toString(),
        prompt,
        userId.toString(),
      ),
    };
  }
}
