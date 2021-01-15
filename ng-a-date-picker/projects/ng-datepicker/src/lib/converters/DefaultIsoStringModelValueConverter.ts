import { ApiModelValueConverter } from '../directives/date/date-configurator';
import { toDate } from '../parsers/format-date';

export class DefaultIsoStringModelValueConverter implements ApiModelValueConverter<string> {
  static readonly INSTANCE = new DefaultIsoStringModelValueConverter();

  fromModel(value: string): Date {
    if (!value || !value?.trim()?.length) return null;
    return toDate(value);
  }

  toModel(value: Date): string {
    if (!value) return null;
    // console.log(value.getTimezoneOffset());
    return value.toISOString();
  }
}
