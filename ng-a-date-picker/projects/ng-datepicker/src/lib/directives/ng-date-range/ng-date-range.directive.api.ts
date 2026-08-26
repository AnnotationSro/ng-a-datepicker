import { DateRange } from '../../model/ng-date-range-public.model';
import { PopupHostApi } from '../../components/popup/positioned-popup-base.component';

export interface NgDateRangeValue {
  dtValue: DateRange;
  ngValue: any;
}

export interface NgDateRangeDirectiveApi extends PopupHostApi {
  readValue: () => NgDateRangeValue;
  changeValue: (value: DateRange) => void;
  getLocale: () => string;
}
