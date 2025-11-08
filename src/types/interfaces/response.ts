import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonError } from './errors';
import { Request, Response } from 'express';

export interface ResponseInterface {
  status: string;
  statusCode: number;
  message: string;
  data?: any;
}

export function customResponse(
  options: Partial<ResponseInterface>,
): ResponseInterface {
  return {
    status: options.status || 'ERROR',
    statusCode: options.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
    message: options.message || 'ERROR',
    data: options?.data,
  };
}

export function customResponseForSuccess(data: any): ResponseInterface {
  return customResponse({
    status: 'SUCCESS',
    statusCode: HttpStatus.OK,
    message: 'API가 성공적으로 호출되었습니다.',
    data,
  });
}

export function customResponseForError(
  error: CommonError | any,
): ResponseInterface {
  return customResponse({
    status: 'ERROR',
    statusCode: error?.errorCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
    message: error?.message ?? 'An error occurred',
    data: error?.data,
  });
}

export function customResponseForException(
  exception: HttpException | Error | any,
): ResponseInterface {
  if (exception instanceof CommonError) {
    return customResponseForError(exception);
  }

  const statusCode =
    exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

  return customResponse({
    status: 'ERROR',
    statusCode,
    message: exception.message || 'An unexpected error occurred',
    data: exception instanceof HttpException ? exception.getResponse() : {},
  });
}

export function onResponse(req: Request, res: Response, options) {
  const response = customResponse(options);
  res.status(response.statusCode).json(response);
}

export function onException(req: Request, res: Response, exception) {
  const response = customResponseForException(exception);
  res.status(response.statusCode).json(response);
}

export function onError(req: Request, res: Response, error) {
  const response = customResponseForError(error);
  res.status(response.statusCode).json(response);
}
