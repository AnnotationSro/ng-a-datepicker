import { toDate } from '../parsers/format-date';
import { NgDateModelValueConverter } from '../ng-date.model';

export class DefaultIsoStringModelValueConverter implements NgDateModelValueConverter<string> {
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
