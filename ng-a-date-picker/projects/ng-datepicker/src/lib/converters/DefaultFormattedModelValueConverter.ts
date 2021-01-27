import { formatDate } from '@angular/common';
import { parseDate } from '../parsers/parse-date';
import { toDate } from '../parsers/format-date';
import { NgDateConfigUtil } from '../conf/ng-date.config.util';
import { ApiNgDateModelValueConverter, ApiNgDateModelValueConverterConf } from '../model/ng-date-public.model';

const localeIso = 'en-US';

export class DefaultFormattedModelValueConverter implements ApiNgDateModelValueConverter<string> {
  // TODO: Used local timezone
  static readonly INSTANCE_ISO_YYYYMMDD: ApiNgDateModelValueConverter<string> = new DefaultFormattedModelValueConverter(
    'yyyy-MM-dd',
    localeIso
  );

  static readonly INSTANCE_ISO_YYYYMMDD_HHMM: ApiNgDateModelValueConverter<string> = new DefaultFormattedModelValueConverter(
    'yyyy-MM-ddTHH:mm',
    localeIso
  );

  static readonly INSTANCE_ISO_YYYYMMDD_HHMMSS: ApiNgDateModelValueConverter<string> = new DefaultFormattedModelValueConverter(
    'yyyy-MM-ddTHH:mm:ss',
    localeIso
  );

  static readonly INSTANCE_ISO_HHMM: ApiNgDateModelValueConverter<string> = new DefaultFormattedModelValueConverter(
    'HH:mm',
    localeIso
  );

  static readonly INSTANCE_ISO_HHMMSS: ApiNgDateModelValueConverter<string> = new DefaultFormattedModelValueConverter(
    'HH:mm:ss',
    localeIso
  );

  constructor(private dateFormat: string, private locale?: string, private timezone?: string) {}

  fromModel(value: any, oldValue: Date, opts: ApiNgDateModelValueConverterConf): Date {
    if (NgDateConfigUtil.isStringConstant(value)) {
      let { locale } = this;
      if (!locale && opts) locale = opts.locale;
      if (!locale) locale = localeIso;
      return parseDate(value, this.dateFormat, locale);
    }
    return toDate(value);
  }

  toModel(value: Date, oldModel: string, opts: ApiNgDateModelValueConverterConf): string {
    let { locale } = this;
    if (!locale && opts) locale = opts.locale;
    if (!locale) locale = localeIso;
    return formatDate(value, this.dateFormat, locale, this.timezone);
  }
}
