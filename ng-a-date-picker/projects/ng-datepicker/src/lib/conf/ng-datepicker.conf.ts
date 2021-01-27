// https://www.usefuldev.com/post/Angular:%20Creating%20configurable%20libraries%20with%20angular%20cli

import { BasicDateFormat, NgDateConfig } from '../model/ng-date-public.model';

type DateFormatConfig = { [key in BasicDateFormat]?: NgDateConfig };

export interface NgDatepickerConf extends DateFormatConfig {
  // common default config
  all?: NgDateConfig;

  // TODO - mfilo - 27.01.2021 - moznost zadefinovat
  // [customConf: string]: { [locale: string]: NgDateConfig };
}
