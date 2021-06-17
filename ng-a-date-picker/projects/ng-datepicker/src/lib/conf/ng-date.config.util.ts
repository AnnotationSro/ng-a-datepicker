import { BasicDateFormat } from '@annotation/ng-parse';
import { DefaultFormattedModelValueConverter } from '../converters/DefaultFormattedModelValueConverter';
import { DefaultDateModelValueConverter } from '../converters/DefaultDateModelValueConverter';
import { DefaultNumberModelValueConverter } from '../converters/DefaultNumberModelValueConverter';
import { DefaultIsoStringModelValueConverter } from '../converters/DefaultIsoStringModelValueConverter';
import { NgDatepickerConf } from './ng-datepicker.conf';
import { HasNgDateConf } from './has-ng-date-conf';
import {
  ApiNgDateModelValueConverter,
  HtmlValueConfig,
  NgDateConfig,
  StandardModelValueConverters,
} from '../model/ng-date-public.model';

const constDefaultConfig: NgDatepickerConf = {
  // // common default config
  // all?: NgDateConfig;

  // specifics config (BasicDateFormat)
  short: {
    // 'M/d/yy, h:mm a'
    displayFormat: 'short',
    modelConverter: 'string-iso-datetime',
  },
  medium: {
    // 'MMM d, y, h:mm:ss a'
    displayFormat: 'medium',
    modelConverter: 'string-iso-datetime',
  },
  long: {
    // 'MMMM d, y, h:mm:ss a z'
    displayFormat: 'long',
    modelConverter: 'string-iso-datetime-with-zone',
  },
  full: {
    // 'EEEE, MMMM d, y, h:mm:ss a zzzz'
    displayFormat: 'full',
    modelConverter: 'string-iso-datetime-with-zone',
  },
  shortDate: {
    // 'M/d/yy'
    displayFormat: 'shortDate',
    modelConverter: 'string-iso-date',
  },
  mediumDate: {
    // 'MMM d, y'
    displayFormat: 'mediumDate',
    modelConverter: 'string-iso-date',
  },
  longDate: {
    // 'MMMM d, y'
    displayFormat: 'longDate',
    modelConverter: 'string-iso-date',
  },
  fullDate: {
    // 'EEEE, MMMM d, y'
    displayFormat: 'fullDate',
    modelConverter: 'string-iso-date',
  },
  shortTime: {
    // 'h:mm a'
    displayFormat: 'shortTime',
    modelConverter: 'string-iso-time',
  },
  mediumTime: {
    // 'h:mm:ss a'
    displayFormat: 'mediumTime',
    modelConverter: 'string-iso-time',
  },
  longTime: {
    // 'h:mm:ss a z'
    displayFormat: 'longTime',
    modelConverter: 'string-iso-time-with-zone',
  },
  fullTime: {
    // 'h:mm:ss a zzzz'
    displayFormat: 'fullTime',
    modelConverter: 'string-iso-time-with-zone',
  },
};

// todo: tests for utility ...
export class NgDateConfigUtil {
  public static isStringConstant(value: any): boolean {
    return value && (typeof value === 'string' || value instanceof String);
  }

  private static _toNgDateConfig(config: BasicDateFormat | NgDateConfig): NgDateConfig {
    if (!config) return null;
    if (NgDateConfigUtil.isStringConstant(config)) {
      return {
        displayFormat: `${config}`,
      } as NgDateConfig;
    }
    return config as NgDateConfig;
  }

  private static _toHtmlValueConfig(config: BasicDateFormat | NgDateConfig): HtmlValueConfig {
    const c = NgDateConfigUtil._toNgDateConfig(config);
    if (!c) return null;
    return {
      displayFormat: c.displayFormat,
      locale: c.locale,
      timezone: c.timezone,
    };
  }

  private static _mergeHtmlValueConfig(ret: HtmlValueConfig, defaultConfig: NgDateConfig): HtmlValueConfig {
    if (!defaultConfig) return ret;
    if (!ret) ret = {} as HtmlValueConfig;
    if (!ret.displayFormat) ret.displayFormat = defaultConfig.displayFormat;
    if (ret.timezone === undefined && defaultConfig.timezone) ret.timezone = defaultConfig.timezone;
    if (ret.locale === undefined && defaultConfig.locale) ret.locale = defaultConfig.locale;
    return ret;
  }

  public static resolveHtmlValueConfig(comp: HasNgDateConf): HtmlValueConfig {
    // if (ConfigUtil.isStringConstant(ngDateConfig)) - todo: it should be use cache for faster resolutions

    // First - we have to read it from directive configuration
    let ret: HtmlValueConfig = NgDateConfigUtil._toHtmlValueConfig(comp.ngDateConfig);

    if (!ret) ret = {} as HtmlValueConfig;

    if (comp.ngDatepickerConf) {
      // Use default from specific default by BasicDateFormat
      if (NgDateConfigUtil.isStringConstant(comp.ngDateConfig)) {
        ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, comp.ngDatepickerConf[`${comp.ngDateConfig}`]);
      } else if (NgDateConfigUtil.isStringConstant(ret.displayFormat)) {
        ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, comp.ngDatepickerConf[`${ret.displayFormat}`]);
      }

      // Use default from ALL
      if (comp.ngDatepickerConf.all) {
        ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, comp.ngDatepickerConf.all);
      }
    }

    // Use predefined default from specific default by BasicDateFormat
    if (NgDateConfigUtil.isStringConstant(comp.ngDateConfig)) {
      ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, constDefaultConfig[`${comp.ngDateConfig}`]);
    } else if (NgDateConfigUtil.isStringConstant(ret.displayFormat)) {
      ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, constDefaultConfig[`${ret.displayFormat}`]);
    }
    // Use default from ALL
    if (constDefaultConfig.all) {
      ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, constDefaultConfig.all);
    }

    // Use hardcoded default
    ret = NgDateConfigUtil._mergeHtmlValueConfig(ret, {
      displayFormat: 'full',
    });

    if (!ret.locale) ret.locale = comp.locale;
    if (!ret.locale) ret.locale = 'en';

    return ret;
  }

  private static _toApiNgDateModelValueConverter(
    config: StandardModelValueConverters | ApiNgDateModelValueConverter<any>
  ): ApiNgDateModelValueConverter<any> {
    if (!config) return null;
    if (NgDateConfigUtil.isStringConstant(config)) {
      switch (config) {
        case 'date':
          return DefaultDateModelValueConverter.INSTANCE;
        case 'number-timestamp':
          return DefaultNumberModelValueConverter.INSTANCE;
        case 'string-iso-date':
          return DefaultFormattedModelValueConverter.INSTANCE_ISO_YYYYMMDD;
        case 'string-iso-datetime-short':
          return DefaultFormattedModelValueConverter.INSTANCE_ISO_YYYYMMDD_HHMM;
        case 'string-iso-datetime':
          return DefaultFormattedModelValueConverter.INSTANCE_ISO_YYYYMMDD_HHMMSS;
        case 'string-iso-datetime-with-zone':
          return DefaultIsoStringModelValueConverter.INSTANCE;
        case 'string-iso-time-short':
          return DefaultFormattedModelValueConverter.INSTANCE_ISO_HHMM;
        case 'string-iso-time':
          return DefaultFormattedModelValueConverter.INSTANCE_ISO_HHMMSS;
        case 'string-iso-time-with-zone':
          throw new Error('Converter is not implemented!');
        default:
          throw new Error(`Converter ${config} is not implemented!`);
      }
    }
    return config as ApiNgDateModelValueConverter<any>;
  }

  public static resolveModelConverter(comp: HasNgDateConf): ApiNgDateModelValueConverter<any> {
    // 1: je ngDateModelConverterConfig
    if (comp.ngDateModelConverterConfig) {
      return NgDateConfigUtil._toApiNgDateModelValueConverter(comp.ngDateModelConverterConfig);
    }

    const dirConf = NgDateConfigUtil._toNgDateConfig(comp.ngDateConfig);

    // 2: je vyhladanie v ramci vseobecneho nastavenia v ngDateConfig
    if (dirConf && dirConf.modelConverter) {
      const ret = NgDateConfigUtil._toApiNgDateModelValueConverter(dirConf.modelConverter);
      if (ret) return ret;
    }

    let format = null;
    if (dirConf && NgDateConfigUtil.isStringConstant(dirConf.displayFormat)) {
      format = `${dirConf.displayFormat}`;
    }

    // 3: je vyhladanie v ramci vseobecneho nastavenia v ngDatepickerConfig (podla vseobecneho formatu - dirConf.displayFormat) a ked sa nenajde tak default
    if (comp.ngDatepickerConf && format) {
      const confByType = comp.ngDatepickerConf[format] as NgDateConfig;
      if (confByType && confByType.modelConverter) {
        const ret = NgDateConfigUtil._toApiNgDateModelValueConverter(confByType.modelConverter);
        if (ret) return ret;
      }
    }

    // 4: Zobranie uplne vseobecneho nastavenia
    if (comp.ngDatepickerConf && comp.ngDatepickerConf.all) {
      const ret = NgDateConfigUtil._toApiNgDateModelValueConverter(comp.ngDatepickerConf.all.modelConverter);
      if (ret) return ret;
    }

    // Use predefined default from specific default by BasicDateFormat
    if (comp.ngDatepickerConf && format) {
      const confByType = constDefaultConfig[format] as NgDateConfig;
      if (confByType && confByType.modelConverter) {
        const ret = NgDateConfigUtil._toApiNgDateModelValueConverter(confByType.modelConverter);
        if (ret) return ret;
      }
    }
    // Use default from ALL
    if (constDefaultConfig.all) {
      const ret = NgDateConfigUtil._toApiNgDateModelValueConverter(constDefaultConfig.all.modelConverter);
      if (ret) return ret;
    }

    // hardcoded default for model => DATE
    return DefaultDateModelValueConverter.INSTANCE;
  }
}
