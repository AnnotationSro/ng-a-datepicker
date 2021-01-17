import { toDate } from '../parsers/format-date';
import { NgDateModelValueConverter } from '../ng-date.model';

export class DefaultDateModelValueConverter implements NgDateModelValueConverter<Date> {
  static readonly INSTANCE = new DefaultDateModelValueConverter();

  fromModel(value: Date): Date {
    return toDate(value);
  }

  toModel(value: Date): Date {
    return value;
  }
}
