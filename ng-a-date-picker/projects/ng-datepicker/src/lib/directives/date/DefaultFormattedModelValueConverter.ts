import { formatDate } from '@angular/common';
import { ApiModelValueConverter, DirectiveDateConfig } from './date-configurator';
import { parseDate } from '../../parsers/date-parser.service';

export class DefaultFormattedModelValueConverter implements ApiModelValueConverter<string> {
  static readonly INSTANCE = new DefaultFormattedModelValueConverter();

  fromModel(value: string, opts: DirectiveDateConfig): Date {
    return parseDate(value, opts.dateFormat, opts.locale);
  }

  toModel(value: Date, oldModel: string, opts: DirectiveDateConfig): string {
    return formatDate(value, opts.dateFormat, opts.locale, opts.timezone);
  }
}
