import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { MessageDto } from './dto/message.dto';
import { AILimitInterceptor } from './interceptors/ai-limit.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@api/auth/decorators/user.decorator';
import { UserDocument } from '@api/users/schema/user.schema';
import { CreateThreadDto } from './dto/create-thread.dto';
import {
  CustomBadRequestException,
  CustomNotFoundException,
} from '@api/common/exceptions/custom-exceptions';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { FilesService } from '@api/files/files.service';

@Controller('openai')
@ApiTags('openai')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
export class OpenAiController {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly filesService: FilesService,
  ) {}

  @Get('file/:openaiFileId')
  async getFile(
    @Param('openaiFileId') openaiFileId: string,
    @Res() res: Response,
  ) {
    const { file, fileContent } =
      await this.openAiService.retrieveFile(openaiFileId);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    // Chuyển ReadableStream thành Node.js Readable Stream
    const nodeStream = Readable.from(fileContent.body as any);
    nodeStream.pipe(res);
  }

  @Post('assistant')
  async createAssistant() {
    return this.openAiService.createAssistant();
  }

  /* ================= THREAD START HERE ===================== */
  @Get('list-threads')
  async getListThread(@User() user: UserDocument) {
    return await this.openAiService.listThreadsByUser(user.id);
  }

  @Post('thread')
  async createThread(
    @User() user: UserDocument,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    return await this.openAiService.createThread(
      user.id,
      createThreadDto.name,
      createThreadDto.description,
    );
  }

  @Get('thread/:threadId')
  async getThread(@Param('threadId') threadId: string) {
    return this.openAiService.retrieveThread(threadId);
  }

  @Get('thread/:threadId/check-ownership')
  async checkThreadOwnership(
    @Param('threadId') threadId: string,
    @User() user: UserDocument,
  ) {
    try {
      const isOwner = await this.openAiService.isThreadOwner(threadId, user.id);
      return { isOwner };
    } catch (error) {
      if (error instanceof CustomNotFoundException) {
        throw error;
      }
      throw new CustomBadRequestException(
        error.message || 'Failed to check thread ownership',
        'checkOwnershipFailed',
      );
    }
  }

  @Delete('thread/:threadId')
  async deleteThread(
    @Param('threadId') threadId: string,
    @User() user: UserDocument,
  ) {
    // Kiểm tra quyền sở hữu thread
    const isOwner = await this.openAiService.isThreadOwner(threadId, user.id);
    if (!isOwner) {
      throw new CustomBadRequestException(
        'You do not have permission to delete this thread',
        'threadPermissionDenied',
      );
    }

    return this.openAiService.deleteThread(threadId);
  }
  /* ================= THREAD END HERE ===================== */

  /* ================= MESSAGE START HERE ===================== */
  @Post('thread/:threadId/message')
  @UseInterceptors(AILimitInterceptor)
  async sendMessage(
    @Param('threadId') threadId: string,
    @Body() messageDto: MessageDto,
    @Res() res: Response,
    @User() user: UserDocument,
  ) {
    // Kiểm tra quyền sở hữu thread
    const isOwner = await this.openAiService.isThreadOwner(threadId, user.id);
    if (!isOwner) {
      throw new CustomBadRequestException(
        'You do not have permission to send messages to this thread',
        'threadPermissionDenied',
      );
    }

    const { content } = messageDto;
    const stream = await this.openAiService.sendMessageToThread(
      threadId,
      content,
      user.id,
    );

    // Đặt header đúng cho stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Pipe node stream vào response
    const nodeStream = Readable.from(stream as any);
    nodeStream.pipe(res);
  }

  @Get('thread/:threadId/list-messages')
  async getListMessageByThread(@Param('threadId') threadId: string) {
    try {
      const result = await this.openAiService.listMessagesByThread(threadId);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      throw new CustomBadRequestException(
        error.message || 'Failed to fetch messages',
        'fetchMessagesFailed',
      );
    }
  }
  /* ================= MESSAGE END HERE ===================== */

  @Post('thread/:threadId/run/:runId')
  async submitToolOutputs(
    @Param('threadId') threadId: string,
    @Param('runId') runId: string,
    @Req() req: Request,
    @Res() res: Response,
    @User() user: UserDocument,
  ) {
    // Kiểm tra quyền sở hữu thread
    const isOwner = await this.openAiService.isThreadOwner(threadId, user.id);
    if (!isOwner) {
      throw new CustomBadRequestException(
        'You do not have permission to submit tool outputs for this thread',
        'threadPermissionDenied',
      );
    }

    const { toolCallOutputs } = req.body;
    const stream = await this.openAiService.submitToolOutputs(
      threadId,
      runId,
      toolCallOutputs,
    );
    res.setHeader('Content-Type', 'text/event-stream');
    // Chuyển Fetch API Stream thành Node.js Readable Stream
    const nodeStream = Readable.from(stream as any);
    nodeStream.pipe(res);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserDocument,
  ) {
    if (!file) {
      throw new CustomBadRequestException('No file provided', 'fileMissing');
    }

    // Upload to OpenAI first
    const openaiResult = await this.openAiService.uploadFile(file);

    // Save file to local database with OpenAI file ID
    await this.filesService.createWithOpenAIFileId(
      file,
      openaiResult.openaiFileId,
      user.id,
    );

    // Return both the OpenAI file ID and local file info
    return {
      id: openaiResult.openaiFileId,
    };
  }

  @Get('usage')
  async getAIUsage(@User() user: UserDocument) {
    return this.openAiService.getUsage(user);
  }

  /* ================= PRODUCT RECOMMENDATION START HERE ===================== */
  @Post('thread/:threadId/recommend-products')
  @ApiOperation({
    summary: 'Get product recommendations based on skin scan results',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of recommended product IDs',
  })
  @UseInterceptors(AILimitInterceptor)
  async getProductRecommendations(
    @Param('threadId') threadId: string,
    @User() user: UserDocument,
  ) {
    try {
      // Check if user owns the thread
      const isOwner = await this.openAiService.isThreadOwner(threadId, user.id);
      if (!isOwner) {
        throw new CustomBadRequestException(
          'Bạn không có quyền truy cập vào đoạn hội thoại này',
          'threadPermissionDenied',
        );
      }

      const recommendedProductIds =
        await this.openAiService.getProductRecommendations(threadId, user.id);

      return {
        success: true,
        recommendedProducts: recommendedProductIds,
      };
    } catch (error) {
      if (
        error instanceof CustomNotFoundException ||
        error instanceof CustomBadRequestException
      ) {
        throw error;
      }
      throw new CustomBadRequestException(
        error.message || 'Không thể lấy gợi ý sản phẩm',
        'productRecommendationFailed',
      );
    }
  }
  /* ================= PRODUCT RECOMMENDATION END HERE ===================== */

  @Get('generate')
  @UseInterceptors(AILimitInterceptor)
  async generateAIResponse() {
    return { message: 'AI response generated successfully!' };
  }
}
