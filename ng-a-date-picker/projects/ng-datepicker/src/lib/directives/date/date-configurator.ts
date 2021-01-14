// converting HTML value <=> Date value (working with std. Date parser&formatter)

export interface HtmlValueConfig {
  dateFormat?: string;
  displayFormat: string;
  timezone?: string;
  locale?: string;
}

export type StandardModelValueConverters =
  | 'formatted'
  | 'number-timestamp'
  | 'date'
  | 'string-iso-datetime-with-zone'
  | 'string-iso-datetime'
  | 'string-iso-time-with-zone'
  | 'string-iso-time'
  | 'string-iso-date';

export interface DirectiveDateConfig extends HtmlValueConfig {
  firstValueConverter?: StandardModelValueConverters | ApiModelValueConverter<any>;
  modelConverter?: StandardModelValueConverters | ApiModelValueConverter<any>;
  popup?: boolean;
}

export interface ApiModelValueConverter<T> {
  fromModel: (value: T, opts?: DirectiveDateConfig) => Date;
  toModel: (value: Date, oldModel: T, opts?: DirectiveDateConfig) => T;
}
