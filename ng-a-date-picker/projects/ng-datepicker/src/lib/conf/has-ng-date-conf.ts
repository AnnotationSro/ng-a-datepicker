import { NgDatepickerConf } from './ng-datepicker.conf';
import {
  ApiNgDateModelValueConverter,
  BasicDateFormat,
  NgDateConfig,
  StandardModelValueConverters,
} from '../model/ng-date-public.model';

export interface HasNgDateConf {
  ngDateConfig?: BasicDateFormat | NgDateConfig;
  ngDateModelConverterConfig?: StandardModelValueConverters | ApiNgDateModelValueConverter<any>;
  ngDatepickerConf?: NgDatepickerConf;
  locale: string;
}
