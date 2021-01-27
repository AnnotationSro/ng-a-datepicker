import { ApiNgDateModelValueConverter } from '../model/ng-date-public.model';
import { toDate } from '../parsers/format-date';

export class DefaultNumberModelValueConverter implements ApiNgDateModelValueConverter<number> {
  static readonly INSTANCE = new DefaultNumberModelValueConverter();

  fromModel(value: string | number | Date): Date {
    return toDate(value);
  }

  toModel(value: Date): number {
    return +value;
  }
}
