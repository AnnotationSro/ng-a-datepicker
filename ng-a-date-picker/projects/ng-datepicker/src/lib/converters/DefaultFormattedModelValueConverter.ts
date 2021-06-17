import { formatDate } from '@angular/common';
import { NgDateConfigUtil } from '../conf/ng-date.config.util';
import { ApiNgDateModelValueConverter, ApiNgDateModelValueConverterConf } from '../model/ng-date-public.model';
import { ParseService } from '../services/parse.service';
import { ServiceLocator } from '../services/service-locator';

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

  private parse: ParseService;
  constructor(private dateFormat: string, private locale?: string, private timezone?: string) {
    const isReady = ServiceLocator.onReady.getValue();
    if (!isReady) {
      ServiceLocator.onReady.subscribe((value) => {
        if (value) {
          this.parse = ServiceLocator.injector.get(ParseService);
        }
      });
    } else {
      this.parse = ServiceLocator.injector.get(ParseService);
    }
  }

  fromModel(value: any, oldValue: Date, opts: ApiNgDateModelValueConverterConf): Date {
    if (NgDateConfigUtil.isStringConstant(value)) {
      let { locale } = this;
      // TODO - mfilo - 27.01.2021 - fixme
      if (!locale && opts) locale = opts.locale; // tuto je defaultne definovane 'en-US' a teda ignoruje locale z conf
      if (!locale) locale = localeIso;

      return this.parse.parseDate(value, this.dateFormat, locale);
    }
    return this.parse.toDate(value);
  }

  toModel(value: Date, oldModel: string, opts: ApiNgDateModelValueConverterConf): string {
    let { locale } = this;
    if (!locale && opts) locale = opts.locale;
    if (!locale) locale = localeIso;
    return formatDate(value, this.dateFormat, locale, this.timezone);
  }
}
