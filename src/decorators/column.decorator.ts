// import createLogger from 'debug';
import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import {
  ColumnType as OriginalColumnType,
  Index,
  Column as OriginalColumn,
} from 'typeorm';
import { CommonError, ERROR } from '../types';

type ColumnType = OriginalColumnType | 'password' | 'any';

export enum Timezone {
  ASIA_SEOUL = 'Asia/Seoul',
  UTC = 'UTC',
}
export interface ColumnOptions {
  type: ColumnType; // 컬럼 타입
  default?: any; // 기본값
  name?: string; // 컬럼 이름
  description?: string; // 컬럼 설명
  enum?: any[] | Record<string, any>; // 열거형 타입
  json?: boolean; // JSON 타입 여부
  length?: number; // 길이 (문자열 타입에 사용)
  nullable?: boolean; // NULL 허용 여부
  onUpdate?: string; // 업데이트 시 실행할 SQL 조각
  precision?: number; // 정밀도 (소수점 타입에 사용)
  required?: boolean; // 필수 여부
  scale?: number; // 스케일 (소수점 타입에 사용, 정밀도 다음에 위치하는 소수점 자리수)
  unique?: boolean; // 유니크 여부
  index?: boolean; // 인덱스 여부
  unsigned?: boolean; // 부호 없는 정수 타입 여부
  example?: any; // 예시
  regex?: string;
}

export function Column(options: ColumnOptions) {
  const { type, description, nullable, unique, required } = options;

  const decorators = [];
  const column: any = { type, nullable, unique };
  const property: any = { description, required };

  if (options.name) {
    column.name = options.name;
  }

  if (options.description) {
    column.comment = options.description;
  }

  if (options.default) {
    column.default = options.default;
  }

  if (options.enum) {
    property.enum = options.enum;
    decorators.push(IsEnum(options.enum));
  }

  if (options.index) {
    decorators.push(Index());
  }
  if (options.regex) {
    decorators.push(Matches(options.regex));
  }

  switch (options.type) {
    case 'char':
    case 'varchar':
      if (!options.length) {
        throw new CommonError({
          error: ERROR.INSUFFICIENT_PARAMS,
          message: 'varchar타입은 반드시 length가 주어져야 합니다. ',
        });
      }
      column.length = options.length;
      decorators.push(OriginalColumn(column));
      decorators.push(IsString);
      decorators.push(Type(() => String));
      break;

    case 'text':
    case 'longtext':
      column.json = options.json;
      decorators.push(OriginalColumn(column));
      decorators.push(IsString);

      if (column.json) {
        decorators.push(Type(() => Object));
      } else {
        decorators.push(Type(() => String));
      }
      break;

    case 'datetime':
      column.onUpdate = options.onUpdate;
      decorators.push(OriginalColumn(column));
      decorators.push(IsString);
      decorators.push(Type(() => Date));
      break;

    case 'password':
      column.type = 'varchar';
      column.length = options.length;
      decorators.push(OriginalColumn(column));
      decorators.push(IsString);
      decorators.push(Type(() => String));
      break;

    // case 'timezone':
    //   column.type = 'varchar';
    //   column.length = 10;
    //   property.enum = Timezone;
    //   decorators.push(IsEnum(Timezone));
    //   decorators.push(OriginalColumn(column));
    //   decorators.push(IsString);
    //   decorators.push(Type(() => String));
    //   break;

    case 'float':
    case 'double':
    case 'decimal':
      column.precision = options.precision;
      column.scale = options.scale;
      column.unsigned = options.unsigned;
      decorators.push(OriginalColumn(column));
      decorators.push(IsNumber);
      decorators.push(Type(() => Number));
      break;

    case 'int':
    case 'bigint':
      column.width = options.length;
      column.unsigned = options.unsigned;
      decorators.push(OriginalColumn(column));
      decorators.push(IsNumber);
      decorators.push(Type(() => Number));
      break;

    case 'boolean':
      decorators.push(OriginalColumn(column));
      decorators.push(IsBoolean);
      decorators.push(Type(() => Boolean));
      break;

    // for DTO
    default:
    case 'string':
      decorators.push(IsString);
      decorators.push(Type(() => String));
      decorators.push(OriginalColumn(column));
      break;

    case 'number':
      decorators.push(IsNumber);
      decorators.push(Type(() => Number));
      break;

    case 'array':
      decorators.push(Type(() => Array));
      break;

    case 'any':
      decorators.push(Type(() => Object));
      break;
  }

  return applyDecorators(...decorators);
}
