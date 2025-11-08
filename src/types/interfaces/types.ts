import { FindOptionsWhere } from 'typeorm';

export enum OrderType {
  DESC = 'DESC',
  ASC = 'ASC',
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  EXCEPTION = 'EXCEPTION',
}

export class JsonProperty {
  [key: string]: any;
}

export interface ClassConstructor {
  new (...args: any[]): object;
}

export class Pagination<T> {
  total: number;
  results: T[];
  page: number;
  take: number;
  hasNext: boolean;

  constructor({
    results,
    total,
    page,
    take,
  }: {
    results: T[];
    total: number;
    page: number;
    skip: number;
    take: number;
  }) {
    this.results = results;
    this.total = total;
    this.page = page;
    this.take = take;
    this.hasNext = this.skip + take < total;
  }

  get skip() {
    return (this.page - 1) * this.take;
  }
}
