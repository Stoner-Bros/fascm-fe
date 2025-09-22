import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = {
      key: 'internalServerError',
      content: 'An unexpected error occurred',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const exceptionObj = exceptionResponse as any;

        if (exceptionObj.message) {
          if (Array.isArray(exceptionObj.message)) {
            // Handle validation errors which typically return an array of messages
            errorMessage = {
              key:
                exceptionObj.messageKey ||
                this.generateErrorKey(status, exceptionObj.error),
              content: exceptionObj.message[0],
            };
          } else {
            errorMessage = {
              key:
                exceptionObj.messageKey ||
                this.generateErrorKey(status, exceptionObj.error),
              content: exceptionObj.message,
            };
          }
        } else {
          errorMessage = {
            key: exceptionObj.messageKey || this.generateErrorKey(status),
            content: exceptionObj.error || 'Error occurred',
          };
        }
      } else if (typeof exceptionResponse === 'string') {
        errorMessage = {
          key: this.generateErrorKey(status),
          content: exceptionResponse,
        };
      }
    } else if (exception instanceof Error) {
      errorMessage = {
        key: 'internalServerError',
        content: exception.message || 'An unexpected error occurred',
      };
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }

  private generateErrorKey(status: number, errorType?: string): string {
    const statusMap: Record<number, string> = {
      400: 'badRequest',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'notFound',
      409: 'conflict',
      422: 'unprocessableEntity',
      429: 'tooManyRequests',
      500: 'internalServerError',
    };

    const baseKey = statusMap[status] || 'error';

    if (errorType) {
      // Convert error type to camelCase
      const errorKeySuffix = errorType
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

      return (
        baseKey +
        errorKeySuffix.charAt(0).toUpperCase() +
        errorKeySuffix.slice(1)
      );
    }

    return baseKey;
  }
}
