# Email Module Documentation

## Overview

Module này cung cấp khả năng gửi email bằng cách sử dụng tài khoản email cá nhân thông qua SMTP service. Hỗ trợ các tính năng sau:

- Gửi email đơn giản với HTML hoặc văn bản thuần túy
- Gửi email với tệp đính kèm
- Sử dụng mẫu (templates) với Handlebars để tạo nội dung email động
- Quản lý các mẫu email trong cơ sở dữ liệu

## Cấu hình

### Biến môi trường

Thêm các biến môi trường sau vào file `.env` của bạn:

```
# Email configuration
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Cấu hình cho các dịch vụ email phổ biến

#### Gmail

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

- Lưu ý: Với Gmail, bạn cần tạo "App Password" thay vì sử dụng mật khẩu Gmail thông thường. Bạn có thể tạo nó tại: https://myaccount.google.com/apppasswords sau khi đã bật xác thực 2 yếu tố.

#### Outlook/Hotmail

```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

#### Yahoo

```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

#### Yandex

```
EMAIL_HOST=smtp.yandex.com
EMAIL_PORT=465
```

## Cách sử dụng

### Gửi email đơn giản

```typescript
import { EmailService } from './email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.emailService.sendEmail({
      to,
      subject: 'Chào mừng bạn đến với ứng dụng của chúng tôi',
      html: `<h1>Xin chào ${name}!</h1><p>Cảm ơn bạn đã đăng ký tài khoản.</p>`,
      text: `Xin chào ${name}! Cảm ơn bạn đã đăng ký tài khoản.`,
    });
  }
}
```

### Gửi email với tệp đính kèm

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Tài liệu của bạn',
  html: '<p>Vui lòng xem tài liệu đính kèm.</p>',
  attachments: [
    {
      filename: 'document.pdf',
      content: pdfBuffer, // Buffer hoặc string
      contentType: 'application/pdf',
    },
  ],
});
```

### Sử dụng templates với Handlebars

Đầu tiên, tạo template trong cơ sở dữ liệu:

```typescript
await this.emailService.createTemplate({
  name: 'Chào mừng người dùng mới',
  type: EmailTemplateType.WELCOME,
  subject: 'Chào mừng đến với ứng dụng của chúng tôi',
  htmlContent:
    '<h1>Xin chào {{name}}!</h1><p>Cảm ơn bạn đã đăng ký tài khoản.</p>',
  textContent: 'Xin chào {{name}}! Cảm ơn bạn đã đăng ký tài khoản.',
});
```

Sau đó, sử dụng template để gửi email:

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  templateType: EmailTemplateType.WELCOME,
  templateData: {
    name: 'John Doe',
  },
});
```

## API Endpoints

### `POST /email/send`

Gửi email

### `GET /email/templates`

Lấy tất cả các mẫu email

### `GET /email/templates/:type`

Lấy mẫu email theo loại

### `POST /email/templates`

Tạo mẫu email mới

### `PUT /email/templates/:id`

Cập nhật mẫu email

### `DELETE /email/templates/:id`

Xóa mẫu email
