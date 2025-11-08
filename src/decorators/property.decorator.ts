import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  IsPositive,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
import * as _ from 'lodash';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { MyLogger } from '../helpers/logger.helper';
import { ClassConstructor } from '../types';
// import { IsFile, IsFiles } from 'nestjs-form-data';
import { JsonProperty } from '../types/interfaces/types';
import { IsFile, IsFiles } from 'nestjs-form-data';

const logger = new MyLogger('app:decorator:schema');

export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'file'
  | 'files'
  | 'array'
  | 'any'
  | 'object'
  | 'json';

export interface PropertyOptions {
  type: PropertyType | ClassConstructor; // 속성의 타입 (예: 'string', 'number' 등)
  items?: any; // 배열 타입일 경우, 배열의 아이템 타입
  default?: any; // 기본값
  description?: string; // 설명
  enum?: any[] | Record<string, any>; // 열거 타입의 값들
  exclude?: boolean; // 제외 여부
  json?: boolean; // JSON 타입 여부
  required?: boolean; // 필수 여부
  example?: any; // 예시
  pattern?: string; // 특정 패턴 검증
  min?: number; // 최소값 (숫자 타입에만 적용)
  max?: number; // 최대값 (숫자 타입에만 적용)
  positive?: boolean; // 양수 여부 (숫자 타입에만 적용)
  dynamic?: boolean;
  schema?: ClassConstructor;
}

export interface SchemaOptions {
  allowUnknown: boolean; // 알 수 없는 속성을 허용할지 여부
}

export function Schema(options: SchemaOptions = { allowUnknown: false }) {
  const { allowUnknown } = options;
  const decorators = [];
  decorators.push(JoiSchemaOptions({ allowUnknown: allowUnknown ?? false }));
  return applyDecorators(...decorators);
}

export function Property(options: PropertyOptions) {
  const { type, description, required } = options;

  const decorators = [];
  const property: any = { description, required };
  const joiSchema = Joi;

  let joiSchemaChain;

  if (options.example) {
    decorators.push(ApiProperty({ example: options.example }));
  }

  if (options.pattern) {
    decorators.push(Matches(options.pattern));
  }

  if (options.enum) {
    property.enum = options.enum;

    // 필수값이 아닌 경우에만 Validate 체크
    if (options.required !== false) {
      decorators.push(IsEnum(options.enum));
    }
  }

  if (options.json) {
    options.schema = JsonProperty;
    options.dynamic = true;
  }

  if (options.required !== true) {
    decorators.push(ApiProperty({ nullable: true }));
  } else {
    decorators.push(IsNotEmpty);
    joiSchemaChain = joiSchema.required();
  }

  switch (type) {
    case 'string':
      joiSchemaChain = joiSchema.string();
      decorators.push(IsString);
      decorators.push(Type(() => String));
      break;

    case 'number':
      joiSchemaChain = joiSchema.number();
      decorators.push(IsNumber);
      decorators.push(Type(() => Number));

      if (options.min) {
        joiSchemaChain = joiSchemaChain.min(options.min);
        decorators.push(Min(options.min));
      }

      if (options.max) {
        joiSchemaChain = joiSchemaChain.max(options.max);
        decorators.push(Max(options.max));
      }

      if (options.positive) {
        joiSchemaChain = joiSchemaChain.positive();
        decorators.push(IsPositive());
      }
      break;

    case 'boolean':
      joiSchemaChain = joiSchema.boolean();
      decorators.push(IsBoolean);
      decorators.push(Type(() => Boolean));
      break;

    case 'date':
      joiSchemaChain = joiSchema.date();
      decorators.push(IsDate);
      decorators.push(Type(() => Date));
      break;

    case 'array':
      joiSchemaChain = joiSchema.array();
      decorators.push(IsArray);

      property.type = 'array';

      if (options.schema) {
        decorators.push(Type(() => options.schema));
        property.type = [options.schema];
      }

      if (options.enum) {
        decorators.push(
          ApiProperty({ type: [options.enum], enum: options.enum }),
        );
        decorators.push(IsEnum(options.enum, { each: true }));
      }

      // property.type = options.schema ? [options.schema] : 'array';

      if (options.items) {
        options.items = _.map(options.items, (item) => {
          if (item.type === 'file') {
            return {
              type: 'string',
              format: 'binary',
            };
          }
          return item;
        });

        decorators.push(ApiProperty({ type: 'array', items: options.items }));
      }

      break;

    case 'file':
      joiSchemaChain = joiSchema.binary();
      decorators.push(IsFile);
      decorators.push(Type(() => File));
      property.type = 'string';
      property.format = 'binary';
      options.required = false;
      break;

    case 'files':
      joiSchemaChain = joiSchema.binary();
      decorators.push(IsFiles);
      decorators.push(Type(() => File));
      // property.type = [File]; 해당 부분에서 에러가 발생
      property.items = { type: 'string', format: 'binary' };
      options.required = false;
      break;

    case 'object':
    case 'json':
    case 'any':
      joiSchemaChain = joiSchema.object();
      decorators.push(IsObject);
      decorators.push(Type(() => options.schema ?? Object));
      break;
    default:
      if (typeof type === 'function') {
        joiSchemaChain = joiSchema.object();
        decorators.push(IsObject);
        decorators.push(Type(() => type));
      } else {
        throw new Error(`Unsupported type: ${type}`);
      }
      break;
  }

  if (options.default) {
    property.default = options.default;
    joiSchemaChain = joiSchemaChain.default(options.default);
  }

  if (options.exclude === true) {
    decorators.push(Exclude());
  } else {
    decorators.push(Expose());
  }

  decorators.push(ApiProperty(property));
  decorators.push(JoiSchema(joiSchemaChain));

  return applyDecorators(...decorators);
}
