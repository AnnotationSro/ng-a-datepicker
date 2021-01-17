import { formatDate } from '@angular/common';
import { parseDate } from '../parsers/parse-date';
import { NgDateConfig, NgDateModelValueConverter } from '../ng-date.model';

export class DefaultFormattedModelValueConverter implements NgDateModelValueConverter<string> {
  static readonly INSTANCE = new DefaultFormattedModelValueConverter();

  fromModel(value: string, opts: NgDateConfig): Date {
    return parseDate(value, opts.dateFormat, opts.locale);
  }

  toModel(value: Date, oldModel: string, opts: NgDateConfig): string {
    return formatDate(value, opts.dateFormat, opts.locale, opts.timezone);
  }
}
