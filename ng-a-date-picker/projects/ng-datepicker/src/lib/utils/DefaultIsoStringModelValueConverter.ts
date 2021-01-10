import { ModelValueConverter } from './date-converter-api';

export class DefaultIsoStringModelValueConverter implements ModelValueConverter<string> {
  static readonly INSTANCE = new DefaultIsoStringModelValueConverter();

  fromModel(value: string): Date {
    if (!value || !value.trim().length) return null;
    return new Date(value);
  }

  toModel(value: Date): string {
    if (!value) return null;
    return value.toISOString();
  }
}
