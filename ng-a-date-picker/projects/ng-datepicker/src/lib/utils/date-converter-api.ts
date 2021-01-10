import { DatePipe } from '@angular/common';

export interface DateConfig {
  isoFormat?: string;
  datePipe: DatePipe;
}
export interface ModelValueConverter<T> {
  fromModel: (value: T, opts?: DateConfig) => Date;
  toModel: (value: Date, opts?: DateConfig) => T;
}

export interface HtmlValueConfig {
  format: string;
  timezone?: string;
  locale?: string;
}

export interface DateConverterApi {
  model?: ModelValueConverter<any>;
  htmlFormat?: string;
}
