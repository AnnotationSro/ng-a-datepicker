import { ApiNgDateModelValueConverterConf } from './ng-date-public.model';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface ApiNgDateRangeModelValueConverter<T> {
  fromModel: (value: T, oldValue?: DateRange, opts?: ApiNgDateModelValueConverterConf) => DateRange;
  toModel: (value: DateRange, oldModel: T, opts?: ApiNgDateModelValueConverterConf) => T;
}

// List of pre-defined range converters
export type StandardRangeModelValueConverters = 'date-range' | 'string-iso-date-range';
