import { toDate } from '../../parsers/angular_commons';
import { ApiModelValueConverter } from './date-configurator';

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
