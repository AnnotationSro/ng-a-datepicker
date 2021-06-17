import { BasicDateFormat } from '@annotation/ng-parse';
import { NgDatepickerConf } from './ng-datepicker.conf';
import { ApiNgDateModelValueConverter, NgDateConfig, StandardModelValueConverters } from '../model/ng-date-public.model';

export interface HasNgDateConf {
  ngDateConfig?: BasicDateFormat | NgDateConfig;
  ngDateModelConverterConfig?: StandardModelValueConverters | ApiNgDateModelValueConverter<any>;
  ngDatepickerConf?: NgDatepickerConf;
  locale: string;
}
