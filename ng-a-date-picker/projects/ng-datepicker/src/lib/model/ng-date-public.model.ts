import { BasicDateFormat } from '@annotation/ng-parse';

// converting HTML value <=> Date value (working with std. Date parser&formatter)

export interface HtmlValueConfig {
  // formatted string visible to user
  displayFormat: BasicDateFormat | string;
  // default = undefined // TODO - mfilo - 15.01.2021 - :)
  timezone?: string;
  // default = en-US
  locale?: string;
}

export interface NgDateConfig extends HtmlValueConfig {
  // // ngModel output if StandardModelValueConverters=formatted
  // /**
  //  * @deprecated The method should not be used
  //  */
  // dateFormat?: BasicDateFormat | string;
  //
  // // handler for initial value, converts date to desired format and vice versa
  // /**
  // * @deprecated The method should not be used
  // */
  // firstValueConverter?: StandardModelValueConverters | NgDateModelValueConverter<any>;
  // converts date to desired format and vice versa, also overrides `DirectiveDateConfig.dateFormat`
  modelConverter?: StandardModelValueConverters | ApiNgDateModelValueConverter<any>;

  // use interactive calendar to select date/time
  popup?: boolean;
}

export interface ApiNgDateModelValueConverterConf {
  locale?: string;
}

export interface ApiNgDateModelValueConverter<T> {
  fromModel: (value: T, oldValue?: Date, opts?: ApiNgDateModelValueConverterConf) => Date;
  toModel: (value: Date, oldModel: T, opts?: ApiNgDateModelValueConverterConf) => T;
}

// List of pre-defined converters
export type StandardModelValueConverters =
  | 'number-timestamp'
  | 'date'
  | 'string-iso-datetime-with-zone'
  | 'string-iso-datetime'
  | 'string-iso-datetime-short'
  | 'string-iso-time-with-zone'
  | 'string-iso-time'
  | 'string-iso-time-short'
  | 'string-iso-date';
