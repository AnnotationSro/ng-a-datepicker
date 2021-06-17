import { Inject, Injectable, Optional } from '@angular/core';
import { parseDate, toDate, getDateFormatParser, DateParser, BasicDateFormat } from '@annotation/ng-parse';
import { NG_DATEPICKER_CONF } from '../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../conf/ng-datepicker.conf';

@Injectable({
  providedIn: 'root',
})
export class ParseService {
  constructor(@Optional() @Inject(NG_DATEPICKER_CONF) private ngDatepickerConf: NgDatepickerConf) {}

  parseDate(value: string, format: BasicDateFormat | string, locale: string, oldValue?: Date): Date {
    if (this.ngDatepickerConf?.parser?.parseDate) {
      return this.ngDatepickerConf.parser.parseDate.call(this, value, format, locale, oldValue);
    }

    return parseDate(value, format, locale, oldValue);
  }

  getDateFormatParser(locale: string, format: BasicDateFormat): DateParser {
    if (this.ngDatepickerConf?.parser?.getDateFormatParser) {
      return this.ngDatepickerConf.parser.getDateFormatParser.call(this, locale, format);
    }

    return getDateFormatParser(locale, format);
  }

  toDate(value: string | number | Date): Date {
    if (this.ngDatepickerConf?.parser?.toDate) {
      return this.ngDatepickerConf.parser.toDate.call(this, value);
    }

    return toDate(value);
  }
}
