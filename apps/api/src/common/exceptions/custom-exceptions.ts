import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomBadRequestException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: message,
        messageKey: key || 'badRequest',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CustomUnauthorizedException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: message,
        messageKey: key || 'unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class CustomForbiddenException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: message,
        messageKey: key || 'forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class CustomNotFoundException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: message,
        messageKey: key || 'notFound',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CustomConflictException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: message,
        messageKey: key || 'conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class CustomInternalServerErrorException extends HttpException {
  constructor(message: string, key?: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: message,
        messageKey: key || 'internalServerError',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
