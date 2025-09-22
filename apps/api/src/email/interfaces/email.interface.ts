import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailTemplateType } from '../schema/email-template.schema';

export class EmailAttachment {
  @ApiProperty({ description: 'The filename of the attachment' })
  filename: string;

  @ApiProperty({
    description: 'The content of the attachment as buffer or string',
  })
  content: Buffer | string;

  @ApiPropertyOptional({ description: 'Content type of the attachment' })
  contentType?: string;
}

export class EmailOptions {
  @ApiProperty({
    description: 'Recipient email address(es)',
    example: 'user@example.com',
  })
  to: string | string[];

  @ApiPropertyOptional({
    description: 'CC recipient email address(es)',
    example: 'cc@example.com',
  })
  cc?: string | string[];

  @ApiPropertyOptional({
    description: 'BCC recipient email address(es)',
    example: 'bcc@example.com',
  })
  bcc?: string | string[];

  @ApiPropertyOptional({
    description: 'Email subject',
    example: 'Welcome to BroGlow',
  })
  subject?: string;

  @ApiPropertyOptional({ description: 'HTML content of the email' })
  html?: string;

  @ApiPropertyOptional({ description: 'Plain text content of the email' })
  text?: string;

  @ApiPropertyOptional({
    description: 'Email attachments',
    type: [EmailAttachment],
  })
  attachments?: EmailAttachment[];

  @ApiPropertyOptional({
    description: 'SES template ID for SES templates',
    example: 'WelcomeTemplate',
  })
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Template data for templates',
    example: { name: 'John Doe' },
  })
  templateData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Email template type for Handlebars templates',
    enum: EmailTemplateType,
    example: EmailTemplateType.WELCOME,
  })
  templateType?: EmailTemplateType;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Welcome Email' })
  name: string;

  @ApiProperty({
    description: 'Template type',
    enum: EmailTemplateType,
    example: EmailTemplateType.WELCOME,
  })
  type: EmailTemplateType;

  @ApiProperty({ description: 'Email subject', example: 'Welcome to BroGlow' })
  subject: string;

  @ApiProperty({
    description: 'HTML content with Handlebars syntax',
    example: '<h1>Welcome {{name}}!</h1><p>Thank you for joining us.</p>',
  })
  htmlContent: string;

  @ApiPropertyOptional({
    description: 'Plain text content with Handlebars syntax',
    example: 'Welcome {{name}}! Thank you for joining us.',
  })
  textContent?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string;
}

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({
    description: 'Template name',
    example: 'Welcome Email',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Email subject',
    example: 'Welcome to BroGlow',
  })
  subject?: string;

  @ApiPropertyOptional({
    description: 'HTML content with Handlebars syntax',
    example: '<h1>Welcome {{name}}!</h1><p>Thank you for joining us.</p>',
  })
  htmlContent?: string;

  @ApiPropertyOptional({
    description: 'Plain text content with Handlebars syntax',
    example: 'Welcome {{name}}! Thank you for joining us.',
  })
  textContent?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string;
}
