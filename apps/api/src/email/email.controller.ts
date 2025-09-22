import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import {
  EmailOptions,
  EmailResponse,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from './interfaces/email.interface';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
  ApiPropertyOptional,
  ApiParam,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  EmailTemplate,
  EmailTemplateType,
} from './schema/email-template.schema';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@api/casl/decorators/roles.decorator';
import { RolesGuard } from '@api/casl/guards/roles.guard';
import { Role as RoleEnum } from '@api/roles/enums/role.enum';

class EmailResponseDto implements EmailResponse {
  @ApiProperty({ description: 'Whether the email was sent successfully' })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The message ID if the email was sent successfully',
  })
  messageId?: string;

  @ApiPropertyOptional({
    description: 'The error message if the email was not sent successfully',
  })
  error?: any;
}

@ApiTags('email')
@Controller('email')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    type: EmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(RoleEnum.ADMIN)
  async sendEmail(@Body() emailOptions: EmailOptions): Promise<EmailResponse> {
    return this.emailService.sendEmail(emailOptions);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({
    status: 200,
    description: 'List of all email templates',
    type: [EmailTemplate],
  })
  @Roles(RoleEnum.ADMIN)
  async getAllTemplates(): Promise<EmailTemplate[]> {
    return this.emailService.getAllTemplates();
  }

  @Get('templates/:type')
  @ApiOperation({ summary: 'Get email template by type' })
  @ApiParam({
    name: 'type',
    enum: EmailTemplateType,
    description: 'The email template type',
  })
  @ApiResponse({
    status: 200,
    description: 'The email template',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles(RoleEnum.ADMIN)
  async getTemplateByType(
    @Param('type') type: EmailTemplateType,
  ): Promise<EmailTemplate> {
    const template = await this.emailService.getTemplateByType(type);
    if (!template) {
      throw new Error(`Template with type ${type} not found`);
    }
    return template;
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new email template' })
  @ApiResponse({
    status: 201,
    description: 'The created email template',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles(RoleEnum.ADMIN)
  async createTemplate(
    @Body() createTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return this.emailService.createTemplate(createTemplateDto);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update an email template' })
  @ApiParam({ name: 'id', description: 'The email template ID' })
  @ApiResponse({
    status: 200,
    description: 'The updated email template',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles(RoleEnum.ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const updated = await this.emailService.updateTemplate(
      id,
      updateTemplateDto,
    );
    if (!updated) {
      throw new Error(`Template with ID ${id} not found`);
    }
    return updated;
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete an email template' })
  @ApiParam({ name: 'id', description: 'The email template ID' })
  @ApiResponse({
    status: 200,
    description: 'Whether the template was deleted successfully',
    type: Boolean,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles(RoleEnum.ADMIN)
  async deleteTemplate(@Param('id') id: string): Promise<boolean> {
    return this.emailService.deleteTemplate(id);
  }
}
