import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let responseData;

    if (typeof errorResponse === 'object') {
      responseData = { ...errorResponse, statusCode: status, success: false };
    } else {
      responseData = {
        message: errorResponse,
        statusCode: status,
        success: false,
      };
    }

    response.status(status).json({
      ...responseData,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
