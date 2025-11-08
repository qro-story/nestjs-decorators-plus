import { Logger } from '@nestjs/common';

export class MyLogger extends Logger {
  private isEnabled: boolean;

  constructor(context: string, isEnabled: boolean = true) {
    super(context); // 상위 Logger 클래스의 context 설정
    this.isEnabled = isEnabled;
  }

  // 기본 NestJS Logger의 log 메소드를 오버라이딩
  log(message: string) {
    if (this.isEnabled) {
      super.log(message); // 활성화 상태일 때만 로그 출력
    }
  }

  // NestJS Logger의 error 메소드를 오버라이딩
  error(message: any) {
    if (this.isEnabled) {
      super.error(message);
    }
  }

  // NestJS Logger의 warn 메소드를 오버라이딩
  warn(message: string) {
    if (this.isEnabled) {
      super.warn(message);
    }
  }

  // NestJS Logger의 debug 메소드를 오버라이딩
  debug(message: string) {
    if (this.isEnabled) {
      super.debug(message);
    }
  }

  // NestJS Logger의 verbose 메소드를 오버라이딩
  verbose(message: string) {
    if (this.isEnabled) {
      super.verbose(message);
    }
  }

  // 로거 활성화/비활성화 설정
  setEnabled(isEnabled: boolean) {
    this.isEnabled = isEnabled;
  }
}
