import { NgDateModelValueConverter } from '../ng-date.model';

export class DefaultNumberModelValueConverter implements NgDateModelValueConverter<number> {
  static readonly INSTANCE = new DefaultNumberModelValueConverter();

  fromModel(value: number): Date {
    return new Date(value);
  }

  toModel(value: Date): number {
    return +value;
  }
}
