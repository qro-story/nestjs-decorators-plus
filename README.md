# nestjs-decorators-plus

[![npm version](https://img.shields.io/npm/v/nestjs-decorators-plus.svg)](https://www.npmjs.com/package/nestjs-decorators-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

> **⚠️ Early Release (v0.1.0)** - 이 라이브러리는 초기 개발 단계입니다. API가 변경될 수 있습니다.

NestJS용 강력하고 사용하기 쉬운 데코레이터 라이브러리입니다. Swagger 문서화, TypeORM 컬럼 정의, 라우트 설정을 단일 데코레이터로 간편하게 처리할 수 있습니다.

## 🚀 Features

- ✅ **@Property**: Swagger + Validation + Transformation 통합 데코레이터
- ✅ **@Route**: NestJS 라우터 + Guards + Interceptors 통합 데코레이터
- ✅ **@Column**: TypeORM 컬럼 + Validation 통합 데코레이터
- ✅ TypeScript 완벽 지원
- ✅ 보일러플레이트 코드 최소화
- ✅ Interceptors, Guards, Pipes, Filters 포함

## 📦 Installation

```bash
npm install nestjs-decorators-plus
# or
yarn add nestjs-decorators-plus
# or
pnpm add nestjs-decorators-plus
```

## 📋 Peer Dependencies

이 패키지를 사용하기 위해서는 다음 의존성들이 필요합니다:

```bash
npm install @nestjs/common @nestjs/swagger @nestjs/passport class-validator class-transformer typeorm joi joi-class-decorators nestjs-form-data reflect-metadata rxjs
```

## 🎯 Usage

### @Property Decorator

DTO 클래스에서 Swagger 문서화와 validation을 한 번에 처리합니다.

```typescript
import { Property } from 'nestjs-decorators-plus';

class CreateUserDto {
  @Property({
    type: 'string',
    required: true,
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @Property({
    type: 'number',
    min: 0,
    max: 150,
    positive: true,
    description: '나이'
  })
  age: number;

  @Property({
    type: 'string',
    enum: ['ADMIN', 'USER'],
    required: true,
    description: '사용자 역할'
  })
  role: string;

  @Property({
    type: 'array',
    schema: String,
    description: '취미 목록'
  })
  hobbies: string[];
}
```

#### Supported Types

- `'string'` - 문자열
- `'number'` - 숫자
- `'boolean'` - 불린
- `'date'` - 날짜
- `'file'` - 파일 업로드 (단일)
- `'files'` - 파일 업로드 (다중)
- `'array'` - 배열
- `'object'` - 객체
- `'json'` - JSON
- `'any'` - 모든 타입

### @Route Decorator

컨트롤러 메서드에서 라우트, 인증, 인터셉터를 한 번에 설정합니다.

```typescript
import { Route, HttpMethodEnum } from 'nestjs-decorators-plus';
import { Controller, Body } from '@nestjs/common';

@Controller('users')
class UserController {
  @Route({
    path: '/',
    method: HttpMethodEnum.POST,
    summary: '사용자 생성',
    description: '새로운 사용자를 생성합니다',
    auth: true,  // Bearer Auth 적용
    guards: [JwtAuthGuard],  // 인증 가드 적용
    timeout: 5000,  // 5초 타임아웃
    transform: UserResponseDto,  // 응답 변환
    tags: ['Users']
  })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Route({
    path: '/:id',
    method: HttpMethodEnum.GET,
    summary: '사용자 조회',
    transform: UserResponseDto
  })
  async getUser(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Route({
    path: '/:id',
    method: HttpMethodEnum.PUT,
    summary: '사용자 업데이트',
    auth: true,
    guards: [JwtAuthGuard],
    transactional: true,  // DB 트랜잭션 자동 처리
    transform: UserResponseDto
  })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
```

#### HTTP Methods

```typescript
enum HttpMethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  ALL = 'ALL',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}
```

### @Column Decorator

TypeORM 엔티티에서 컬럼 정의와 validation을 통합합니다.

```typescript
import { Column } from 'nestjs-decorators-plus';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    index: true,
    description: '사용자 이메일',
    nullable: false
  })
  email: string;

  @Column({
    type: 'password',  // varchar로 자동 변환
    length: 255,
    description: '비밀번호 해시'
  })
  password: string;

  @Column({
    type: 'text',
    json: true,  // JSON 타입으로 처리
    nullable: true,
    description: '사용자 설정'
  })
  settings: any;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    description: '로그인 횟수'
  })
  loginCount: number;

  @Column({
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
    description: '마지막 업데이트 시간'
  })
  updatedAt: Date;
}
```

### Interceptors

패키지에 포함된 유용한 인터셉터들:

```typescript
import {
  DeserializeInterceptor,
  TimeoutInterceptor,
  TransactionInterceptor,
  ResponseInterceptor
} from 'nestjs-decorators-plus';

// 응답 변환
@UseInterceptors(new DeserializeInterceptor(UserDto))
@Get()
getUsers() { ... }

// 타임아웃 설정
@UseInterceptors(new TimeoutInterceptor(3000))
@Get()
getUsers() { ... }

// 트랜잭션 처리
@UseInterceptors(TransactionInterceptor)
@Post()
createUser() { ... }
```

### Custom Validation Pipe

```typescript
import { CustomValidationPipe, ParamValidationPipe } from 'nestjs-decorators-plus';

// 전역 적용
app.useGlobalPipes(new CustomValidationPipe());

// 개별 파라미터에 적용
@Get(':id')
getUser(@Param('id', ParamValidationPipe) id: string) { ... }
```

### Logger Helper

```typescript
import { MyLogger } from 'nestjs-decorators-plus';

const logger = new MyLogger('UserService', true);

logger.log('User created');
logger.error('Error creating user');
logger.warn('Warning: User already exists');
logger.debug('Debug info');

// 로거 비활성화
logger.setEnabled(false);
```

## 📚 API Documentation

### Property Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `PropertyType \| ClassConstructor` | 속성 타입 (필수) |
| `required` | `boolean` | 필수 여부 (기본값: false) |
| `description` | `string` | 설명 |
| `example` | `any` | 예시값 |
| `enum` | `any[]` | 열거형 값 |
| `min` | `number` | 최소값 (숫자 타입) |
| `max` | `number` | 최대값 (숫자 타입) |
| `positive` | `boolean` | 양수 여부 (숫자 타입) |
| `pattern` | `string` | 정규식 패턴 |
| `items` | `any` | 배열 아이템 타입 |
| `schema` | `ClassConstructor` | 중첩 객체 스키마 |
| `default` | `any` | 기본값 |
| `exclude` | `boolean` | 응답에서 제외 |
| `json` | `boolean` | JSON 타입 여부 |
| `dynamic` | `boolean` | 동적 타입 여부 |

### Route Options

| Option | Type | Description |
|--------|------|-------------|
| `path` | `string` | 라우트 경로 (필수) |
| `method` | `HttpMethodEnum` | HTTP 메서드 (필수) |
| `summary` | `string` | API 요약 |
| `description` | `string` | API 상세 설명 |
| `tags` | `string[]` | Swagger 태그 |
| `auth` | `boolean` | 인증 필요 여부 |
| `guards` | `Type<CanActivate>[]` | 가드 배열 |
| `timeout` | `number` | 타임아웃 (ms) |
| `transform` | `ClassConstructor` | 응답 변환 클래스 |
| `transactional` | `boolean` | 트랜잭션 처리 여부 |
| `redirect` | `boolean` | 리다이렉트 여부 |
| `exclude` | `boolean` | Swagger 문서에서 제외 |

### Column Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `ColumnType` | 컬럼 타입 (필수) |
| `length` | `number` | 길이 (varchar, char) |
| `nullable` | `boolean` | NULL 허용 여부 |
| `unique` | `boolean` | 유니크 제약 |
| `index` | `boolean` | 인덱스 생성 |
| `default` | `any` | 기본값 |
| `name` | `string` | 컬럼 이름 |
| `description` | `string` | 컬럼 설명 |
| `enum` | `any[]` | 열거형 값 |
| `json` | `boolean` | JSON 타입 여부 |
| `precision` | `number` | 정밀도 (decimal) |
| `scale` | `number` | 스케일 (decimal) |
| `unsigned` | `boolean` | 부호 없는 정수 |
| `onUpdate` | `string` | 업데이트 시 실행할 SQL |
| `regex` | `string` | 정규식 검증 패턴 |

## 🔧 Advanced Usage

### Schema Decorator

여러 Property를 사용하는 DTO 클래스에 스키마 옵션을 설정합니다:

```typescript
import { Schema, Property } from 'nestjs-decorators-plus';

@Schema({ allowUnknown: false })
class CreateUserDto {
  @Property({ type: 'string', required: true })
  name: string;

  @Property({ type: 'string', required: true })
  email: string;
}
```

### Nested Objects

중첩된 객체를 사용할 수 있습니다:

```typescript
class AddressDto {
  @Property({ type: 'string', required: true })
  street: string;

  @Property({ type: 'string', required: true })
  city: string;
}

class UserDto {
  @Property({ type: 'string', required: true })
  name: string;

  @Property({ type: AddressDto, required: true })
  address: AddressDto;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

Copyright (c) 2025 qro-story

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🐛 Issues

버그를 발견하셨나요? [GitHub Issues](https://github.com/qro-story/nestjs-decorators-plus/issues)에 리포트해주세요.
