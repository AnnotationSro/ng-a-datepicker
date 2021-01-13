import {ApiModelValueConverter} from "./ApiModelValueConverter";
import {toDate} from "../../parsers/date-parser.service";

export class DefaultIsoStringModelValueConverter implements ApiModelValueConverter<string> {
  static readonly INSTANCE = new DefaultIsoStringModelValueConverter();

  fromModel(value: string): Date {
    if (!value || !value.trim().length) return null;
    return toDate(value);
  }

  toModel(value: Date): string {
    if (!value) return null;
    return value.toISOString();
  }
}
