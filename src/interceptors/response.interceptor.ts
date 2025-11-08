import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MyLogger } from '../helpers/logger.helper';
import { customResponseForSuccess } from '../types';

const logger = new MyLogger('app:core:interceptor:global');

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // eslint-disable-next-line prettier/prettier
        const req = context.switchToHttp().getRequest();
        // const res = context.switchToHttp().getResponse();

        logger.log(data);

        if (req.customResponse === true) {
          return data;
        }

        return customResponseForSuccess(data);
      }),
    );
  }
}
