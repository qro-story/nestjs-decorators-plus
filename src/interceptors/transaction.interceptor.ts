import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { Observable, catchError, concatMap, finalize } from 'rxjs';
import { DataSource } from 'typeorm';

export const ENTITY_MANAGER_KEY = 'ENTITY_MANAGER';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    // get request object
    const req = context.switchToHttp().getRequest<Request>();
    // start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // attach query manager with transaction to the request
    // 하나의 manaager객체에
    req[ENTITY_MANAGER_KEY] = queryRunner.manager;

    /**
     * interceptor는 요청과 응답 사이의 stream을 처리를 담당한다.
     * TransactionInterceptor을 사용하는 여러 라우트 핸들러가 존재할 때
     * 각 Route 핸들러는 각자만의 queryRunner를 갖게 된다. 각 transaction 처리가
     * 발생하게 되었을 때 라우트 핸들러가 요청되는 순서가 보장되는 것이 중요한데 이를 보장하기 위해
     * rxjs의 concatMap을 사용했다고 볼 수 있다.
     */

    return next.handle().pipe(
      // concatMap을 통해 observable의 순서를 보장하면서 route handler가 complete되고 진행하도록 한다.
      concatMap(async (data) => {
        console.log('-----------------------------------');
        console.log(data);
        console.log('-----------------------------------');

        await queryRunner.commitTransaction(); // transaction에 대한 commit은 한번만 진행된다.
        return data;
      }),
      // observable객체의 반환 값중에서 에러가 발생하면 rollback처리를 할 수 있도록 한다.
      catchError(async (e) => {
        await queryRunner.rollbackTransaction();
        throw e;
      }),
      // 최종적으로는 release되도록 하여 connection을 마무리 한다.
      finalize(async () => {
        await queryRunner.release();
      }),
    );
  }
}
