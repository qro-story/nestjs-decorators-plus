import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import * as _ from 'lodash';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (_.isPlainObject(value)) {
      value = _.mapValues(value, (val: any) => (val === 'false' ? false : val));
    }
    return super.transform(value, metadata);
  }
}
