import { toDate } from '../parsers/format-date';
import { ApiNgDateModelValueConverter } from '../model/ng-date-public.model';

export class DefaultDateModelValueConverter implements ApiNgDateModelValueConverter<Date> {
  static readonly INSTANCE = new DefaultDateModelValueConverter();

  fromModel(value: string | number | Date): Date {
    return toDate(value);
  }

  toModel(value: Date): Date {
    return value;
  }
}
