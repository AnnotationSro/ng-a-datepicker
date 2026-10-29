import { ApiNgDateRangeModelValueConverter, DateRange } from '../model/ng-date-range-public.model';
import { DefaultDateModelValueConverter } from './DefaultDateModelValueConverter';

export class DefaultDateRangeModelValueConverter implements ApiNgDateRangeModelValueConverter<DateRange> {
  static readonly INSTANCE = new DefaultDateRangeModelValueConverter();

  fromModel(value: DateRange): DateRange {
    return {
      start: value?.start ? DefaultDateModelValueConverter.INSTANCE.fromModel(value.start) : null,
      end: value?.end ? DefaultDateModelValueConverter.INSTANCE.fromModel(value.end) : null,
    };
  }

  toModel(value: DateRange): DateRange {
    return {
      start: value?.start ?? null,
      end: value?.end ?? null,
    };
  }
}
