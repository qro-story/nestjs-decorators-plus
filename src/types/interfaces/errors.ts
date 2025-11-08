import { HttpStatus, HttpException } from '@nestjs/common';
import { STATUS_CODES } from 'http';

export interface ErrorInterface {
  error: ERROR;
  errorCode?: number;
  message?: string;
}

export class CommonError extends Error {
  error: ERROR;
  errorCode: number;
  message: string;

  constructor({ error, errorCode, message }: ErrorInterface) {
    super(message || error);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CommonError);
    }
    this.error = error;
    this.errorCode =
      ERROR_CODE[error] || errorCode || HttpStatus.INTERNAL_SERVER_ERROR;
    this.message = message || STATUS_CODES[this.errorCode];
  }
}

export enum ERROR {
  ALREADY_USED_DATA = 'ALREADY_USED_DATA',
  NO_EXISTS_DATA = 'NO_EXISTS_DATA',
  NO_EXISTS_USER = 'NO_EXISTS_USER',
  INSUFFICIENT_PARAMS = 'INSUFFICIENT_PARAMS',
  INVALID_PERMISSION = 'INVALID_PERMISSION',
  INVALID_PARAMS = 'INVALID_PARAMS',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NOT_ALLOWED_REMOVE_ALL = 'NOT_ALLOWED_REMOVE_ALL',
  EXPIRED_PERMISSION = 'EXPIRED_PERMISSION',
  UNKNOWN_EXCEPTION = 'UNKNOWN_EXCEPTION',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export const ERROR_CODE: { [key in ERROR]: number } = {
  [ERROR.ALREADY_USED_DATA]: 402,
  [ERROR.NO_EXISTS_DATA]: 404,
  [ERROR.NO_EXISTS_USER]: 404,
  [ERROR.INSUFFICIENT_PARAMS]: 400,
  [ERROR.INVALID_PERMISSION]: 403,
  [ERROR.INVALID_PARAMS]: 400,
  [ERROR.INVALID_REQUEST]: 400,
  [ERROR.NOT_ALLOWED_REMOVE_ALL]: 400,
  [ERROR.EXPIRED_PERMISSION]: 403,
  [ERROR.UNAUTHORIZED]: 401,
  [ERROR.INVALID_TOKEN]: 401,
  [ERROR.UNKNOWN_EXCEPTION]: 500,
};
