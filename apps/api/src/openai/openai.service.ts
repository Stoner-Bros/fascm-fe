import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { AIUsage } from './schema/ai-usage.schema';
import { UserDocument } from '@api/users/schema/user.schema';
import { Thread } from './schema/thread.schema';
import { Message } from './schema/message.schema';
import { File } from '@api/files/schema/file.schema';
import {
  CustomBadRequestException,
  CustomNotFoundException,
} from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';
import { FilesService } from '@api/files/files.service';
import { SkinProfileService } from '@api/skin-profile/skin-profile.service';
import { Product } from '@api/products/schema/product.schema';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private assistantId: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(AIUsage.name) private aiUsageModel: Model<AIUsage>,
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private filesService: FilesService,
    private skinProfileService: SkinProfileService,
  ) {
    this.openai = new OpenAI();
    this.assistantId = this.configService.get('OPENAI_ASSISTANT_ID') ?? '';
  }

  // Function to enhance content with skin profile data
  private async enhanceContentWithSkinProfile(
    userId: string,
    content: any,
  ): Promise<any> {
    try {
      // Check if user has a skin profile
      const skinProfile = await this.skinProfileService
        .getUserSkinProfile(userId)
        .catch(() => null);

      if (!skinProfile) {
        // Return original content if no profile found
        return content;
      }

      // Create an enhanced content with skin profile information
      const skinProfileInfo = {
        skinType: skinProfile.skinType || 'Chưa xác định',
        concerns: skinProfile.concerns || [],
        recommendations: skinProfile.recommendations || '',
        answers: [] as any[],
      };

      // Format each answer with corresponding question and description
      if (skinProfile.answers && skinProfile.answers.length > 0) {
        for (const answer of skinProfile.answers) {
          // Using any type to bypass TypeScript strict type checking
          // This works because we know Mongoose has populated the questionId field
          const questionObj = answer.questionId as any;
          if (
            questionObj &&
            typeof questionObj === 'object' &&
            questionObj.question
          ) {
            // Find the selected option(s)
            let selectedOptions: any[] = [];
            if (Array.isArray(answer.answer)) {
              // Multiple choice answers
              selectedOptions = questionObj.options.filter((option: any) =>
                answer.answer.includes(option.value),
              );
            } else {
              // Single choice answer
              const selectedOption = questionObj.options.find(
                (option: any) => option.value === answer.answer,
              );
              if (selectedOption) {
                selectedOptions = [selectedOption];
              }
            }

            // Format answer with labels and descriptions
            const answerLabels = selectedOptions
              .map((option) => option.label)
              .join(', ');
            const answerDescriptions = selectedOptions
              .filter((option) => option.description)
              .map((option) => option.description)
              .join('; ');

            skinProfileInfo.answers.push({
              question: questionObj.question,
              answer: answerLabels,
              description: answerDescriptions || undefined,
            });
          }
        }
      }

      // Format the final content based on original content type
      if (typeof content === 'string') {
        // If original content is plain text, add the skin profile context
        return `[THÔNG TIN HỒ SƠ DA CỦA NGƯỜI DÙNG]
Loại da: ${skinProfileInfo.skinType}
Các vấn đề quan tâm: ${skinProfileInfo.concerns.join(', ')}
${skinProfileInfo.answers
  .map((a) => {
    let answerText = `Hỏi: ${a.question}\nTrả lời: ${a.answer}`;
    if (a.description) {
      answerText += `\nMô tả: ${a.description}`;
    }
    return answerText;
  })
  .join('\n')}
[KẾT THÚC THÔNG TIN HỒ SƠ DA]

Yêu cầu của người dùng: ${content}`;
      } else if (Array.isArray(content)) {
        // If content is already an array (for images etc.), add skin profile as the first text item
        const skinProfileText = `[THÔNG TIN HỒ SƠ DA CỦA NGƯỜI DÙNG]
Loại da: ${skinProfileInfo.skinType}
Các vấn đề quan tâm: ${skinProfileInfo.concerns.join(', ')}
${skinProfileInfo.answers
  .map((a) => {
    let answerText = `Hỏi: ${a.question}\nTrả lời: ${a.answer}`;
    if (a.description) {
      answerText += `\nMô tả: ${a.description}`;
    }
    return answerText;
  })
  .join('\n')}
[KẾT THÚC THÔNG TIN HỒ SƠ DA]`;

        // Create a new array instead of modifying the original content
        let enhancedContent: any[];

        // Check if first item is text type and modify it, otherwise add new first item
        if (content.length > 0 && content[0].type === 'text') {
          // Create a deep copy of the first item and modify it
          const firstItem = { ...content[0] };
          firstItem.text =
            skinProfileText + '\n\nYêu cầu của người dùng: ' + firstItem.text;

          // Create new array with modified first item and rest of original content
          enhancedContent = [firstItem, ...content.slice(1)];
        } else {
          // Add new text item for skin profile at the beginning
          enhancedContent = [
            { type: 'text', text: skinProfileText },
            ...content,
          ];
        }

        return enhancedContent;
      }

      // Fallback: return original content
      return content;
    } catch (error) {
      console.error('Error enhancing content with skin profile:', error);
      // Return original content if there was an error
      return content;
    }
  }

  async retrieveFile(openaiFileId: string) {
    const [file, fileContent] = await Promise.all([
      this.openai.files.retrieve(openaiFileId),
      this.openai.files.content(openaiFileId),
    ]);
    return { file, fileContent };
  }

  async createAssistant() {
    const assistant = await this.openai.beta.assistants.create({
      instructions: 'Bạn là một trợ lý hữu ích về chăm sóc da.',
      name: 'Trợ lý BroGlow',
      model: 'gpt-4o',
      tools: [
        { type: 'code_interpreter' },
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Xác định thời tiết tại vị trí của tôi',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description:
                    'Thành phố và tiểu bang, ví dụ: Hà Nội, Việt Nam',
                },
                unit: { type: 'string', enum: ['c', 'f'] },
              },
              required: ['location'],
            },
          },
        },
        { type: 'file_search' },
      ],
    });
    return { assistantId: assistant.id };
  }

  /* ================= THREAD START HERE ===================== */
  async createThread(ownerId: number, name?: string, description?: string) {
    const thread = await this.openai.beta.threads.create();
    const openaiThreadId = thread.id;

    const newThread = new this.threadModel({
      openaiThreadId,
      name,
      description,
      owner: ownerId,
    });

    return await newThread.save();
  }

  async listThreadsByUser(ownerId: number) {
    return await this.threadModel
      .find({ owner: ownerId })
      .sort({ createdAt: -1 });
  }

  async retrieveThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(
        `Thread with ID ${threadId} not found`,
        'threadNotFound',
      );
    }
    return await this.openai.beta.threads.retrieve(thread.openaiThreadId);
  }

  async deleteThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(
        `Thread with ID ${threadId} not found`,
        'threadNotFound',
      );
    }

    try {
      await this.openai.beta.threads.del(thread.openaiThreadId);
    } catch (error) {
      console.error('Failed to delete thread on OpenAI:', error);
      throw new CustomBadRequestException(
        'Could not delete thread on OpenAI',
        'threadDeletionFailed',
      );
    }

    await this.threadModel.deleteOne({ _id: threadId });

    return { message: `Thread ${threadId} deleted successfully` };
  }
  /* ================= THREAD END HERE ===================== */

  /* ================= MESSAGE START HERE ===================== */
  async sendMessageToThread(threadId: string, content: any, userId?: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(
        `Không tìm thấy đoạn hội thoại với ID ${threadId}`,
        'threadNotFound',
      );
    }

    // Enhance content with skin profile if userId is provided
    let enhancedContent = content;
    if (userId) {
      enhancedContent = await this.enhanceContentWithSkinProfile(
        userId,
        content,
      );
    }

    try {
      const userMessage = await this.openai.beta.threads.messages.create(
        thread.openaiThreadId,
        { role: 'user', content: enhancedContent },
      );

      const userMsgEntity = new this.messageModel({
        openaiMessageId: userMessage.id,
        content:
          typeof content === 'string' ? content : JSON.stringify(content),
        thread: threadId,
        sender: 'user',
        metadata: {
          contentType: typeof content === 'object' ? 'json' : 'text',
          timestamp: new Date().toISOString(),
        },
      });

      const savedUserMsg = await userMsgEntity.save();

      // Xử lý files nếu có trong content
      const fileIds = [];

      // Kiểm tra nếu content là mảng (format OpenAI)
      if (Array.isArray(content)) {
        // Lọc các phần tử có type là image_file
        const imageFileItems = content.filter(
          (item) => item.type === 'image_file' && item.image_file?.file_id,
        );

        // Lấy file_id từ mỗi image_file
        for (const item of imageFileItems) {
          if (item.image_file?.file_id) {
            fileIds.push(item.image_file.file_id);
          }
        }
      }

      // Xử lý files tìm thấy trong content
      if (fileIds.length > 0) {
        // Kiểm tra từng file trong fileIds
        for (const openaiFileId of fileIds) {
          // Tìm file có openaiFileId trong hệ thống
          const existingFile = await this.fileModel.findOne({ openaiFileId });

          if (existingFile) {
            // Nếu file đã tồn tại, cập nhật message ID
            await this.filesService.updateFileWithMessage(
              existingFile._id as unknown as string,
              savedUserMsg._id as unknown as string,
            );
          } else {
            // Nếu không tìm thấy file, tạo mới record chỉ với openaiFileId và message
            const newFile = new this.fileModel({
              openaiFileId,
              message: savedUserMsg._id,
            });
            await newFile.save();
          }
        }
      }

      const stream = await this.openai.beta.threads.runs.stream(
        thread.openaiThreadId,
        { assistant_id: this.assistantId },
      );

      let assistantMessageId = '';
      let assistantContent = '';

      stream.on('messageDone', (message: any) => {
        assistantMessageId = message.id;
      });

      stream.on('textDelta', (delta: any) => {
        const text = delta?.value || delta?.text || '';
        assistantContent += text;
      });

      stream.on('end', async () => {
        try {
          const assistantMsg = new this.messageModel({
            openaiMessageId: assistantMessageId || `assistant-${Date.now()}`,
            content: assistantContent,
            thread: threadId,
            sender: 'assistant',
            metadata: {
              contentType: 'text',
              timestamp: new Date().toISOString(),
              complete: !!assistantMessageId,
            },
          });

          await assistantMsg.save();

          // Auto-generate thread name if needed
          if (!thread.name) {
            // Non-blocking operation to generate thread name
            this.generateThreadName(threadId, content, assistantContent).catch(
              (error) => {
                console.error('Thread naming error:', error);
              },
            );
          }
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      });

      return stream.toReadableStream();
    } catch (error) {
      console.error('Error in sendMessageToThread:', error);
      throw new CustomBadRequestException(
        error.message || 'Failed to send message to thread',
        'sendMessageFailed',
      );
    }
  }

  async listMessagesByThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(
        `Thread with ID ${threadId} not found`,
        'threadNotFound',
      );
    }

    const messages = await this.messageModel
      .find({ thread: threadId })
      .sort({ createdAt: 1 });

    const formattedMessages = [];

    for (const message of messages) {
      // const files = await this.fileModel.find({ message: message._id });

      let messageContent;
      try {
        if (message.metadata?.contentType === 'json') {
          messageContent = JSON.parse(message.content);
        } else {
          messageContent = [
            {
              type: 'text',
              text: { value: message.content },
            },
          ];
        }
      } catch (e) {
        console.error('Error in listMessagesByThread:', e);

        messageContent = [
          {
            type: 'text',
            text: { value: message.content },
          },
        ];
      }

      // if (files.length > 0) {
      //   const fileObjects = files.map((file) => ({
      //     type: 'image_file',
      //     image_file: {
      //       file_id: file.openaiFileId,
      //     },
      //   }));

      //   if (Array.isArray(messageContent)) {
      //     messageContent = [...messageContent, ...fileObjects];
      //   } else {
      //     messageContent = [
      //       { type: 'text', text: { value: message.content } },
      //       ...fileObjects,
      //     ];
      //   }
      // }

      formattedMessages.push({
        id: message._id,
        role: message.sender,
        content: messageContent,
        created_at: message.createdAt,
        thread_id: threadId,
        openai_id: message.openaiMessageId,
        metadata: message.metadata || {},
      });
    }

    return {
      data: formattedMessages,
      total: formattedMessages.length,
    };
  }
  /* ================= MESSAGE END HERE ===================== */

  async submitToolOutputs(
    threadId: string,
    runId: string,
    toolCallOutputs: any,
  ) {
    const stream = this.openai.beta.threads.runs.submitToolOutputsStream(
      threadId,
      runId,
      { tool_outputs: toolCallOutputs },
    );

    return stream.toReadableStream();
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(file.path);

      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.mimetype });

      formData.append('file', blob, file.originalname);
      formData.append('purpose', 'vision');

      const response = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY') ?? ''}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.id) {
        throw new CustomBadRequestException(
          'Upload file to OpenAI failed',
          'openaiUploadFailed',
        );
      }

      return { openaiFileId: data.id };
    } catch (error) {
      console.error('File upload error:', error);
      throw new CustomBadRequestException(
        error.message || 'Upload file failed',
        'fileUploadFailed',
      );
    }
  }

  async getUsage(user: UserDocument): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() - 7);

    const usage = await this.aiUsageModel.findOne({
      user: user._id.toString(),
      createdAt: { $gte: today },
    });

    return usage ? usage.promptCount : 0;
  }

  async incrementUsage(user: UserDocument, limit: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() - 7);

    const userId = user._id.toString();

    let usage = await this.aiUsageModel.findOne({
      user: userId,
      createdAt: { $gte: today },
    });

    if (!usage) {
      usage = new this.aiUsageModel({ user: userId, promptCount: 0 });
    }

    if (usage.promptCount >= limit) return false;

    usage.promptCount += 1;
    await usage.save();
    return true;
  }

  async resetDailyUsage(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.aiUsageModel.deleteMany({ createdAt: { $lt: today } });
  }

  /**
   * Generate and set a thread name based on conversation content
   * @param threadId - The thread ID
   * @param userContent - The user message content
   * @param assistantContent - The assistant response content
   */
  private async generateThreadName(
    threadId: string,
    userContent: any,
    assistantContent: string,
  ): Promise<void> {
    try {
      // Truncate content for the API request (to avoid token limits)
      const userContentStr =
        typeof userContent === 'string'
          ? userContent.substring(0, 500)
          : JSON.stringify(userContent).substring(0, 500);

      const assistantContentStr = assistantContent.substring(0, 500);

      const summaryPrompt = `Bạn là một AI giúp tóm tắt đoạn hội thoại dưới đây thành một tiêu đề ngắn gọn (tối đa 40 ký tự).
Tiêu đề phải ngắn gọn, súc tích, phản ánh nội dung chính của cuộc trò chuyện.
Không sử dụng dấu ngoặc kép.

Đoạn hội thoại:
Người dùng: ${userContentStr}
Trợ lý: ${assistantContentStr}

Tiêu đề:`;

      const titleResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Bạn là một AI giúp tạo tiêu đề ngắn gọn.',
          },
          { role: 'user', content: summaryPrompt },
        ],
        max_tokens: 40,
        temperature: 0.7,
      });

      const generatedTitle = titleResponse.choices[0]?.message?.content?.trim();

      if (generatedTitle) {
        // Update thread with the generated name
        const updatedThread = await this.threadModel.findByIdAndUpdate(
          threadId,
          { name: generatedTitle },
          { new: true },
        );

        if (!updatedThread) {
          console.warn(
            `Could not update thread ${threadId} with generated title`,
          );
        }
      }
    } catch (error) {
      console.error('Error generating thread title:', error);
      // Error is caught and logged but not re-thrown to prevent blocking the main response flow
    }
  }

  /**
   * Check if a user is the owner of a thread
   * @param threadId Thread ID to check
   * @param userId User ID to check ownership for
   * @returns boolean indicating if the user is the owner
   */
  async isThreadOwner(threadId: string, userId: string): Promise<boolean> {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);

    if (!thread) {
      throw new CustomNotFoundException(
        `Thread with ID ${threadId} not found`,
        'threadNotFound',
      );
    }

    // Convert to string for comparison if needed
    const ownerId = thread.owner.toString();
    const userIdStr = userId.toString();

    return ownerId === userIdStr;
  }

  /* ================= PRODUCT RECOMMENDATION START HERE ===================== */
  async getProductRecommendations(
    threadId: string,
    userId: string,
  ): Promise<string[]> {
    validateObjectId(threadId, 'thread');

    // Check if thread exists and user owns it
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(
        `Không tìm thấy đoạn hội thoại với ID ${threadId}`,
        'threadNotFound',
      );
    }

    const isOwner = await this.isThreadOwner(threadId, userId);
    if (!isOwner) {
      throw new CustomBadRequestException(
        'Bạn không có quyền truy cập vào đoạn hội thoại này',
        'threadPermissionDenied',
      );
    }

    // Get all products from the system
    const products = await this.productModel.find({ isActive: true }).exec();

    if (!products || products.length === 0) {
      throw new CustomBadRequestException(
        'Không có sản phẩm nào trong hệ thống',
        'noProductsFound',
      );
    }

    // Format products for OpenAI
    const productsInfo = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      brand: product.brand,
      description: product.description || '',
      categories: product.categories || [],
      benefits: product.benefits || [],
      price: product.price || 0,
    }));

    // Send message to thread with products data
    await this.openai.beta.threads.messages.create(thread.openaiThreadId, {
      role: 'user',
      content: `Dựa vào kết quả phân tích da và các cuộc trò chuyện trước đó, vui lòng gợi ý các sản phẩm phù hợp nhất từ danh sách sau. Chỉ trả về ID của các sản phẩm được gợi ý, tối đa 5 sản phẩm, định dạng JSON: ["id1", "id2", "id3"]. Danh sách sản phẩm: ${JSON.stringify(productsInfo)}`,
    });

    // Create a run to process the message
    const run = await this.openai.beta.threads.runs.create(
      thread.openaiThreadId,
      {
        assistant_id: this.assistantId,
      },
    );

    // Poll for completion
    let runStatus = await this.openai.beta.threads.runs.retrieve(
      thread.openaiThreadId,
      run.id,
    );

    // Wait for the run to complete
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      // Wait for 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await this.openai.beta.threads.runs.retrieve(
        thread.openaiThreadId,
        run.id,
      );

      if (runStatus.status === 'failed') {
        throw new CustomBadRequestException(
          'Không thể xử lý yêu cầu gợi ý sản phẩm',
          'productRecommendationFailed',
        );
      }
    }

    // Get the assistant's response
    const messages = await this.openai.beta.threads.messages.list(
      thread.openaiThreadId,
      { order: 'desc', limit: 1 },
    );

    // Extract the product IDs from the response
    const assistantMessage = messages.data[0];
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      throw new CustomBadRequestException(
        'Không nhận được phản hồi từ AI',
        'noAssistantResponse',
      );
    }

    try {
      // Extract JSON from the response
      const messageContent = assistantMessage.content[0];
      if (messageContent.type !== 'text') {
        throw new Error('Expected text response from assistant');
      }

      const contentText = messageContent.text.value;
      // Find JSON array in the text
      const jsonMatch = contentText.match(/\[.*?\]/);

      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const productIds = JSON.parse(jsonMatch[0]);

      // Validate that all IDs exist in our database
      const validProductIds = [];
      for (const id of productIds) {
        try {
          const exists = await this.productModel.exists({ _id: id });
          if (exists) {
            validProductIds.push(id);
          }
        } catch {
          // Skip invalid IDs
          console.error(`Invalid product ID: ${id}`);
        }
      }

      return validProductIds;
    } catch {
      console.error('Error parsing product recommendations');
      throw new CustomBadRequestException(
        'Không thể phân tích phản hồi gợi ý sản phẩm',
        'invalidRecommendationFormat',
      );
    }
  }
  /* ================= PRODUCT RECOMMENDATION END HERE ===================== */
}
