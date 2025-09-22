import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as Handlebars from 'handlebars';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailOptions, EmailResponse } from './interfaces/email.interface';
import {
  EmailTemplate,
  EmailTemplateType,
} from './schema/email-template.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly sender: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplate>,
  ) {
    const senderEmail = this.configService.get<string>('EMAIL_SENDER');
    if (!senderEmail) {
      throw new Error('EMAIL_SENDER is not defined in environment variables');
    }
    this.sender = senderEmail;

    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT');

    if (!emailPassword || !emailHost || !emailPort) {
      throw new Error(
        'Email credentials are not properly configured in environment variables',
      );
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: senderEmail,
        pass: emailPassword,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (options.templateData && options.templateType) {
        return this.sendHandlebarsTemplateEmail(options);
      } else if (options.templateId) {
        // For backward compatibility, redirect to Handlebars templates
        return this.sendHandlebarsTemplateEmail({
          ...options,
          templateType: options.templateId as unknown as EmailTemplateType,
        });
      } else {
        return this.sendRawEmail(options);
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  private async sendRawEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, subject, html, text, attachments } = options;

      // Prepare email data
      const mailOptions: Mail.Options = {
        from: this.sender,
        to: Array.isArray(to) ? to.join(',') : to,
        ...(cc && { cc: Array.isArray(cc) ? cc.join(',') : cc }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(',') : bcc }),
        subject,
        ...(html && { html }),
        ...(text && { text }),
        ...(attachments && {
          attachments: attachments.map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          })),
        }),
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send raw email: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error,
      };
    }
  }

  private async sendHandlebarsTemplateEmail(
    options: EmailOptions,
  ): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, templateType, templateData } = options;

      if (!templateType) {
        throw new Error(
          'Template type is required for Handlebars template emails',
        );
      }

      // Get template from database
      const template = await this.emailTemplateModel.findOne({
        type: templateType,
      });
      if (!template) {
        throw new Error(
          `Template with type ${templateType} not found in the database`,
        );
      }

      // Compile the Handlebars template
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      const htmlContent = htmlTemplate(templateData || {});

      let textContent = '';
      if (template.textContent) {
        const textTemplate = Handlebars.compile(template.textContent);
        textContent = textTemplate(templateData || {});
      }

      // Send the email using the raw email method
      return this.sendRawEmail({
        to,
        cc,
        bcc,
        subject: template.subject,
        html: htmlContent,
        text: textContent || undefined,
        attachments: options.attachments,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send Handlebars template email: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error,
      };
    }
  }

  async getTemplateByType(
    type: EmailTemplateType,
  ): Promise<EmailTemplate | null> {
    return this.emailTemplateModel.findOne({ type });
  }

  async createTemplate(
    template: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    const newTemplate = new this.emailTemplateModel(template);
    return newTemplate.save();
  }

  async updateTemplate(
    id: string,
    template: Partial<EmailTemplate>,
  ): Promise<EmailTemplate | null> {
    return this.emailTemplateModel.findByIdAndUpdate(id, template, {
      new: true,
    });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.emailTemplateModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateModel.find();
  }
}
