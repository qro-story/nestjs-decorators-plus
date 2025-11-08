import { v4 as UUID } from 'uuid';
import { ValueTransformer } from 'typeorm';
import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { getMetadataArgsStorage } from 'typeorm/globals';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { MyLogger } from '../helpers/logger.helper';

const logger = new MyLogger('app:decorator:custom:column');

export const uuid = () => {
  return UUID().replace(/-/gi, '');
};

export interface CustomColumnOptions extends ColumnOptions {
  json?: boolean;
}

export function isNullOrUndefined<T>(
  obj: T | null | undefined,
): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null;
}

// Boolean
export class BooleanTransformer implements ValueTransformer {
  public from(value?: number | null): boolean | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }
    return value ? true : false;
  }

  public to(value?: boolean | null): number | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }
    return value ? 1 : 0;
  }
}

// Json
export const parseJsonTransformer = <T>(json: string): T | undefined => {
  return JSON.parse(json, (_: string, value: any): any => {
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    ) {
      const date = Date.parse(value);
      if (!isNaN(date)) {
        return new Date(date);
      }
    }
    return value;
  });
};

export class JsonTransformer<T> implements ValueTransformer {
  constructor(private readonly defaultValue?: T) {}

  public from(value?: string | T | null): T | undefined {
    if (isNullOrUndefined(value)) {
      // If defaultValue is also null or undefined, return undefined
      if (isNullOrUndefined(this.defaultValue)) {
        return undefined;
      }
      // Attempt to parse defaultValue if it's a string, otherwise return it directly
      // eslint-disable-next-line prettier/prettier
      return typeof this.defaultValue === 'string'
        ? (JSON.parse(this.defaultValue) as T)
        : this.defaultValue;
    }

    try {
      // Directly return the value if it's not a string (assuming it's already the correct type)
      if (typeof value !== 'string') {
        return value as T;
      }
      // Attempt to parse the string value into JSON
      return parseJsonTransformer<T>(value);
    } catch (e: any) {
      // If parsing fails, log the error and return the defaultValue
      logger.error(`JsonTransformer parse error: ${e.message}`);
      if (isNullOrUndefined(this.defaultValue)) {
        return undefined;
      }
      // eslint-disable-next-line prettier/prettier
      return typeof this.defaultValue === 'string'
        ? (JSON.parse(this.defaultValue) as T)
        : this.defaultValue;
    }
  }

  public to(value?: T | null): string | undefined {
    if (isNullOrUndefined(value)) {
      // If value and defaultValue are both null or undefined, return '{}'
      if (isNullOrUndefined(this.defaultValue)) {
        return '{}';
      }
      // Attempt to stringify defaultValue if it's not null or undefined
      return JSON.stringify(this.defaultValue);
    }

    // Stringify the value directly if it's not null or undefined
    return JSON.stringify(value);
  }
}

// UUID
export class UUIDTransformer implements ValueTransformer {
  public from(value?: string | null): string | null | undefined {
    if (!value || value === 'UUID') {
      return uuid();
    }
    return value;
  }

  public to(value?: string | null): string | null | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }
    return value;
  }
}

export function CustomColumn(options?: CustomColumnOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    const columnOptions: ColumnOptions = options || {};

    if (options?.type === 'boolean') {
      columnOptions.type = 'tinyint';
      columnOptions.width = 1;
      columnOptions.default = options?.default ? 1 : 0;
      columnOptions.transformer = new BooleanTransformer();
    }

    if (options?.json === true) {
      columnOptions.transformer = new JsonTransformer();
    }

    if (options?.default === 'UUID') {
      columnOptions.transformer = new UUIDTransformer();
    }

    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName: propertyName,
      mode: 'regular',
      options: columnOptions,
    } as ColumnMetadataArgs);
  };
}
