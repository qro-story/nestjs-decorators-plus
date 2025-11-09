# nestjs-decorators-plus

[![npm version](https://img.shields.io/npm/v/nestjs-decorators-plus.svg)](https://www.npmjs.com/package/nestjs-decorators-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

> **⚠️ Early Release (v0.1.0)** - This library is in early development. API may change.

A powerful and easy-to-use decorator library for NestJS. Handle Swagger documentation, TypeORM column definitions, and route configurations with a single decorator.

## 🚀 Features

- ✅ **@Property**: Unified decorator for Swagger + Validation + Transformation
- ✅ **@Route**: Unified decorator for NestJS Router + Guards + Interceptors
- ✅ **@Column**: Unified decorator for TypeORM Column + Validation
- ✅ Full TypeScript support
- ✅ Minimize boilerplate code
- ✅ Built-in Interceptors, Guards, Pipes, and Filters

## 📦 Installation

```bash
npm install nestjs-decorators-plus
# or
yarn add nestjs-decorators-plus
# or
pnpm add nestjs-decorators-plus
```

## 📋 Peer Dependencies

This package requires the following dependencies:

```bash
npm install @nestjs/common @nestjs/swagger @nestjs/passport class-validator class-transformer typeorm joi joi-class-decorators nestjs-form-data reflect-metadata rxjs
```

## 🎯 Usage

### @Property Decorator

Handle Swagger documentation and validation in DTO classes at once.

```typescript
import { Property } from 'nestjs-decorators-plus';

class CreateUserDto {
  @Property({
    type: 'string',
    required: true,
    description: 'User name',
    example: 'John Doe'
  })
  name: string;

  @Property({
    type: 'number',
    min: 0,
    max: 150,
    positive: true,
    description: 'User age'
  })
  age: number;

  @Property({
    type: 'string',
    enum: ['ADMIN', 'USER'],
    required: true,
    description: 'User role'
  })
  role: string;

  @Property({
    type: 'array',
    schema: String,
    description: 'User hobbies'
  })
  hobbies: string[];
}
```

#### Supported Types

- `'string'` - String
- `'number'` - Number
- `'boolean'` - Boolean
- `'date'` - Date
- `'file'` - File upload (single)
- `'files'` - File upload (multiple)
- `'array'` - Array
- `'object'` - Object
- `'json'` - JSON
- `'any'` - Any type

### @Route Decorator

Configure routes, authentication, and interceptors in controller methods at once.

```typescript
import { Route, HttpMethodEnum } from 'nestjs-decorators-plus';
import { Controller, Body } from '@nestjs/common';

@Controller('users')
class UserController {
  @Route({
    path: '/',
    method: HttpMethodEnum.POST,
    summary: 'Create user',
    description: 'Create a new user',
    auth: true,  // Apply Bearer Auth
    guards: [JwtAuthGuard],  // Apply authentication guard
    timeout: 5000,  // 5 second timeout
    transform: UserResponseDto,  // Transform response
    tags: ['Users']
  })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Route({
    path: '/:id',
    method: HttpMethodEnum.GET,
    summary: 'Get user',
    transform: UserResponseDto
  })
  async getUser(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Route({
    path: '/:id',
    method: HttpMethodEnum.PUT,
    summary: 'Update user',
    auth: true,
    guards: [JwtAuthGuard],
    transactional: true,  // Automatic DB transaction handling
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

Integrate column definitions and validation in TypeORM entities.

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
    description: 'User email',
    nullable: false
  })
  email: string;

  @Column({
    type: 'password',  // Automatically converted to varchar
    length: 255,
    description: 'Password hash'
  })
  password: string;

  @Column({
    type: 'text',
    json: true,  // Treated as JSON type
    nullable: true,
    description: 'User settings'
  })
  settings: any;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    description: 'Login count'
  })
  loginCount: number;

  @Column({
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
    description: 'Last update time'
  })
  updatedAt: Date;
}
```

### Interceptors

Useful interceptors included in the package:

```typescript
import {
  DeserializeInterceptor,
  TimeoutInterceptor,
  TransactionInterceptor,
  ResponseInterceptor
} from 'nestjs-decorators-plus';

// Response transformation
@UseInterceptors(new DeserializeInterceptor(UserDto))
@Get()
getUsers() { ... }

// Timeout configuration
@UseInterceptors(new TimeoutInterceptor(3000))
@Get()
getUsers() { ... }

// Transaction handling
@UseInterceptors(TransactionInterceptor)
@Post()
createUser() { ... }
```

### Custom Validation Pipe

```typescript
import { CustomValidationPipe, ParamValidationPipe } from 'nestjs-decorators-plus';

// Global application
app.useGlobalPipes(new CustomValidationPipe());

// Individual parameter application
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

// Disable logger
logger.setEnabled(false);
```

## 📚 API Documentation

### Property Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `PropertyType \| ClassConstructor` | Property type (required) |
| `required` | `boolean` | Required flag (default: false) |
| `description` | `string` | Description |
| `example` | `any` | Example value |
| `enum` | `any[]` | Enum values |
| `min` | `number` | Minimum value (number type) |
| `max` | `number` | Maximum value (number type) |
| `positive` | `boolean` | Positive flag (number type) |
| `pattern` | `string` | Regex pattern |
| `items` | `any` | Array item type |
| `schema` | `ClassConstructor` | Nested object schema |
| `default` | `any` | Default value |
| `exclude` | `boolean` | Exclude from response |
| `json` | `boolean` | JSON type flag |
| `dynamic` | `boolean` | Dynamic type flag |

### Route Options

| Option | Type | Description |
|--------|------|-------------|
| `path` | `string` | Route path (required) |
| `method` | `HttpMethodEnum` | HTTP method (required) |
| `summary` | `string` | API summary |
| `description` | `string` | API detailed description |
| `tags` | `string[]` | Swagger tags |
| `auth` | `boolean` | Authentication required |
| `guards` | `Type<CanActivate>[]` | Guard array |
| `timeout` | `number` | Timeout (ms) |
| `transform` | `ClassConstructor` | Response transformation class |
| `transactional` | `boolean` | Transaction handling flag |
| `redirect` | `boolean` | Redirect flag |
| `exclude` | `boolean` | Exclude from Swagger documentation |

### Column Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `ColumnType` | Column type (required) |
| `length` | `number` | Length (varchar, char) |
| `nullable` | `boolean` | NULL allowed |
| `unique` | `boolean` | Unique constraint |
| `index` | `boolean` | Create index |
| `default` | `any` | Default value |
| `name` | `string` | Column name |
| `description` | `string` | Column description |
| `enum` | `any[]` | Enum values |
| `json` | `boolean` | JSON type flag |
| `precision` | `number` | Precision (decimal) |
| `scale` | `number` | Scale (decimal) |
| `unsigned` | `boolean` | Unsigned integer |
| `onUpdate` | `string` | SQL to execute on update |
| `regex` | `string` | Regex validation pattern |

## 🔧 Advanced Usage

### Schema Decorator

Set schema options for DTO classes using multiple Properties:

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

You can use nested objects:

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

Found a bug? Please report it at [GitHub Issues](https://github.com/qro-story/nestjs-decorators-plus/issues).
