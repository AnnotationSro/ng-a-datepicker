import {DirectiveDateConfig} from './date-configurator';

// converting MODEL type value <=> Date value
export interface ApiModelValueConverter<T> {
  fromModel: (value: T, opts?: DirectiveDateConfig) => Date;
  toModel: (value: Date, oldModel: T, opts?: DirectiveDateConfig) => T;
}
