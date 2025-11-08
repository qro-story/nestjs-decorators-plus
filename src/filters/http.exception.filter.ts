import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { MyLogger } from '../helpers/logger.helper';
import { onError, onException } from '../types';
import { Request, Response } from 'express';

const logger = new MyLogger('app:core:http:exception:filter');

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const method = req.method;

    const log = {
      timestamp: new Date().toISOString(),
      method: method,
      url: req.url,
      exception: exception.stack,
    };

    logger.error(log);

    if (exception instanceof HttpException) {
      onException(req, res, exception);
    } else {
      onError(req, res, exception);
    }
  }
}
