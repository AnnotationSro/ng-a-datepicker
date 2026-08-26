import { ApiNgDateModelValueConverter, ApiNgDateModelValueConverterConf } from '../model/ng-date-public.model';
import { ApiNgDateRangeModelValueConverter, DateRange } from '../model/ng-date-range-public.model';
import { DefaultFormattedModelValueConverter } from './DefaultFormattedModelValueConverter';

export interface StringDateRange {
  start: string | null;
  end: string | null;
}

export class DefaultFormattedRangeModelValueConverter implements ApiNgDateRangeModelValueConverter<StringDateRange> {
  static readonly INSTANCE_ISO_YYYYMMDD: ApiNgDateRangeModelValueConverter<StringDateRange> =
    new DefaultFormattedRangeModelValueConverter(DefaultFormattedModelValueConverter.INSTANCE_ISO_YYYYMMDD);

  constructor(private dateConverter: ApiNgDateModelValueConverter<string>) {}

  fromModel(value: StringDateRange, oldValue?: DateRange, opts?: ApiNgDateModelValueConverterConf): DateRange {
    return {
      start: value?.start ? this.dateConverter.fromModel(value.start, oldValue?.start, opts) : null,
      end: value?.end ? this.dateConverter.fromModel(value.end, oldValue?.end, opts) : null,
    };
  }

  toModel(value: DateRange, oldModel?: StringDateRange, opts?: ApiNgDateModelValueConverterConf): StringDateRange {
    return {
      start: value?.start ? this.dateConverter.toModel(value.start, oldModel?.start, opts) : null,
      end: value?.end ? this.dateConverter.toModel(value.end, oldModel?.end, opts) : null,
    };
  }
}
