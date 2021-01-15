// https://www.usefuldev.com/post/Angular:%20Creating%20configurable%20libraries%20with%20angular%20cli
import { DirectiveDateConfig } from '../directives/date/date-configurator';

export interface NgDatepickerConf {
  ngDateConf?: DirectiveDateConfig;
}
