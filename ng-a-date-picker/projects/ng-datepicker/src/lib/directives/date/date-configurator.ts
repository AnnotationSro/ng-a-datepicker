import { DatePipe } from '@angular/common';
import {ApiModelValueConverter} from "./ApiModelValueConverter";



// converting HTML value <=> Date value (working with std. Date parser&formatter)
export interface HtmlValueConfig {
  format: string;
  timezone?: string;
  locale?: string;
}

export type StandardModelValueConverters =
  | 'number-timestamp'
  | 'date'
  | 'string-iso-datetime-with-zone'
  | 'string-iso-datetime'
  | 'string-iso-time-with-zone'
  | 'string-iso-time'
  | 'string-iso-date';

export interface DirectiveDateConfig extends HtmlValueConfig {
  modelConverter?: StandardModelValueConverters | ApiModelValueConverter<any>;
  popup?: boolean;
}

