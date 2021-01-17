import { BasicDateFormat, NgDateConfig, NgDateModelValueConverter, StandardModelValueConverters } from './ng-date.model';
import { DefaultFormattedModelValueConverter } from './converters/DefaultFormattedModelValueConverter';
import { DefaultDateModelValueConverter } from './converters/DefaultDateModelValueConverter';
import { DefaultNumberModelValueConverter } from './converters/DefaultNumberModelValueConverter';
import { DefaultIsoStringModelValueConverter } from './converters/DefaultIsoStringModelValueConverter';

export const getConverter = (
  modelConverters: StandardModelValueConverters | NgDateModelValueConverter<any>,
  config: NgDateConfig
): NgDateModelValueConverter<any> => {
  switch (modelConverters) {
    case 'formatted':
      return DefaultFormattedModelValueConverter.INSTANCE;
    case 'date':
      return DefaultDateModelValueConverter.INSTANCE;
    case 'number-timestamp':
      return DefaultNumberModelValueConverter.INSTANCE;
    case 'string-iso-date':
      // TODO - mfilo - 14.01.2021 - format as const/static field
      config.dateFormat = 'YYYY-MM-dd';
      return DefaultFormattedModelValueConverter.INSTANCE;
    case 'string-iso-datetime':
      // TODO - mfilo - 14.01.2021 - format as const/static field
      config.dateFormat = 'YYYY-MM-ddTHH:mm';
      return DefaultFormattedModelValueConverter.INSTANCE;
    case 'string-iso-datetime-with-zone':
      return DefaultIsoStringModelValueConverter.INSTANCE;
    case 'string-iso-time':
      // TODO - mfilo - 14.01.2021 - format as const/static field
      config.dateFormat = 'HH:mm';
      return new DefaultFormattedModelValueConverter();
    case 'string-iso-time-with-zone':
      throw new Error('Converter not implemented error!');
    default:
      throw new Error('Unknown converter type!');
  }
};

export class NgDateDefaultConfig {
  private static default: NgDateConfig = {
    popup: true, // TODO - mfilo - 15.01.2021 - implement
    modelConverter: 'string-iso-datetime-with-zone' as StandardModelValueConverters,
    displayFormat: 'long' as BasicDateFormat,
    timezone: undefined, // TODO - mfilo - 15.01.2021 - implement
    locale: 'en-US',
    firstValueConverter: undefined,
    dateFormat: undefined,
  };

  static getConfig(): NgDateConfig {
    return NgDateDefaultConfig.default;
  }

  static fixConfig(input: NgDateConfig): NgDateConfig {
    const isUndef = (inp: any) => typeof inp === 'undefined';

    return {
      popup: isUndef(input.popup) ? NgDateDefaultConfig.default.popup : input.popup,
      modelConverter: isUndef(input.modelConverter) ? NgDateDefaultConfig.default.modelConverter : input.modelConverter,
      displayFormat: isUndef(input.displayFormat) ? NgDateDefaultConfig.default.displayFormat : input.displayFormat,
      timezone: isUndef(input.timezone) ? NgDateDefaultConfig.default.timezone : input.timezone,
      locale: isUndef(input.locale) ? NgDateDefaultConfig.default.locale : input.locale,
      firstValueConverter: isUndef(input.firstValueConverter)
        ? NgDateDefaultConfig.default.firstValueConverter
        : input.firstValueConverter,
      dateFormat: isUndef(input.dateFormat) ? NgDateDefaultConfig.default.dateFormat : input.dateFormat,
    };
  }
}
