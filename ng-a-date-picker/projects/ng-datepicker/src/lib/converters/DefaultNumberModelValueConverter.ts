import { ApiModelValueConverter } from '../directives/date/date-configurator';

export class DefaultNumberModelValueConverter implements ApiModelValueConverter<number> {
  static readonly INSTANCE = new DefaultNumberModelValueConverter();

  fromModel(value: number): Date {
    return new Date(value);
  }

  toModel(value: Date): number {
    return +value;
  }
}
