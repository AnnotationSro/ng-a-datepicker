import { ApiModelValueConverter } from './date-configurator';
import { toDate } from '../../parsers/angular_commons';

export class DefaultDateModelValueConverter implements ApiModelValueConverter<Date> {
  static readonly INSTANCE = new DefaultDateModelValueConverter();

  fromModel(value: Date): Date {
    return toDate(value);
  }

  toModel(value: Date): Date {
    return value;
  }
}
