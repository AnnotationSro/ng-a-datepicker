import { ModelValueConverter } from './date-converter-api';

export class DefaultDateModelValueConverter implements ModelValueConverter<Date> {
  static readonly INSTANCE = new DefaultDateModelValueConverter();

  fromModel(value: Date): Date {
    return value;
  }

  toModel(value: Date): Date {
    return value;
  }
}
