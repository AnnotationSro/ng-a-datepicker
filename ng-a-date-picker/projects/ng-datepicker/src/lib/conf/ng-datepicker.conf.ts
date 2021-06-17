// https://www.usefuldev.com/post/Angular:%20Creating%20configurable%20libraries%20with%20angular%20cli

import { BasicDateFormat, DateParser } from '@annotation/ng-parse';
import { NgDateConfig } from '../model/ng-date-public.model';

type DateFormatConfig = { [key in BasicDateFormat]?: NgDateConfig };
type DateParserConfig = {
  parseDate: (value: string, format: BasicDateFormat | string, locale: string, oldValue?: Date) => Date;
  getDateFormatParser: (locale: string, format: BasicDateFormat | string) => DateParser;
  toDate: (value: string | number | Date) => Date;
};

export interface NgDatepickerConf extends DateFormatConfig {
  // custom date parsing
  parser?: DateParserConfig;

  // common default config
  all?: NgDateConfig;

  // TODO - mfilo - 27.01.2021 - moznost zadefinovat
  // [customConf: string]: { [locale: string]: NgDateConfig };
}
