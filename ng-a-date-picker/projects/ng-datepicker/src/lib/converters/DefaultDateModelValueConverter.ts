import { ApiModelValueConverter } from '../directives/date/date-configurator';
import { toDate } from '../parsers/format-date';

export class DefaultDateModelValueConverter implements ApiModelValueConverter<Date> {
  static readonly INSTANCE = new DefaultDateModelValueConverter();

  fromModel(value: Date): Date {
    return toDate(value);
  }

  toModel(value: Date): Date {
    return value;
  }
}
