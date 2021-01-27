// https://www.usefuldev.com/post/Angular:%20Creating%20configurable%20libraries%20with%20angular%20cli

import { NgDateConfig } from '../model/ng-date-public.model';

export interface NgDatepickerConf {
  // common default config
  all?: NgDateConfig;

  // specifics config (BasicDateFormat)
  short?: NgDateConfig;
  medium?: NgDateConfig;
  long?: NgDateConfig;
  full?: NgDateConfig;
  shortDate?: NgDateConfig;
  mediumDate?: NgDateConfig;
  longDate?: NgDateConfig;
  fullDate?: NgDateConfig;
  shortTime?: NgDateConfig;
  mediumTime?: NgDateConfig;
  longTime?: NgDateConfig;
  fullTime?: NgDateConfig;
}
