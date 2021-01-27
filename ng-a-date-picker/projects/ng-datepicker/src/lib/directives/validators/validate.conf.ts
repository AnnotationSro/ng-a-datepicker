import { AbstractControl, ValidatorFn } from '@angular/forms';
import { formatDate } from '@angular/common';
import { NgDateConfigUtil } from '../../conf/ng-date.config.util';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';

export type NgDateMaxValidationError = {
  maxDate: { rejectedValue: any; rejectedValueFormatted: string; maxDateAllowed: any; maxDateAllowedFormatted: string };
} | null;
export type NgDateMinValidationError = {
  minDate: { rejectedValue: any; rejectedValueFormatted: string; minDateAllowed: any; minDateAllowedFormatted: string };
} | null;

export class NgDateValidators {
  static minDate(minDate: any, comp: HasNgDateConf): ValidatorFn {
    function valFn(control: AbstractControl): NgDateMinValidationError {
      if (!control.value) return null;

      const minAsDate = +NgDateValidators.valueToDate(minDate, comp);
      const valueAsDate = +NgDateValidators.valueToDate(control.value, comp);

      return valueAsDate < minAsDate
        ? {
            minDate: {
              rejectedValue: control.value,
              rejectedValueFormatted: NgDateValidators.valueToDisplayFormat(control.value, comp),
              minDateAllowed: minDate,
              minDateAllowedFormatted: NgDateValidators.valueToDisplayFormat(minDate, comp),
            },
          }
        : null;
    }

    return valFn;
  }

  static maxDate(maxDate: any, ngDateConfig: HasNgDateConf): ValidatorFn {
    function valFn(control: AbstractControl): NgDateMaxValidationError {
      if (!control.value) return null;

      const maxAsDate = +NgDateValidators.valueToDate(maxDate, ngDateConfig);
      const valueAsDate = +NgDateValidators.valueToDate(control.value, ngDateConfig);

      return valueAsDate > maxAsDate
        ? {
            maxDate: {
              rejectedValue: control.value,
              rejectedValueFormatted: NgDateValidators.valueToDisplayFormat(control.value, ngDateConfig),
              maxDateAllowed: maxDate,
              maxDateAllowedFormatted: NgDateValidators.valueToDisplayFormat(maxDate, ngDateConfig),
            },
          }
        : null;
    }

    return valFn;
  }

  private static valueToDate(value: any, config: HasNgDateConf): Date {
    const converter = NgDateConfigUtil.resolveModelConverter(config);
    return converter.fromModel(value);
  }

  private static valueToDisplayFormat(value: any, config: HasNgDateConf): string {
    const converter = NgDateConfigUtil.resolveModelConverter(config);
    const date = converter.fromModel(value);

    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(config);
    return formatDate(date, htmlValueConfig.displayFormat, htmlValueConfig.locale, htmlValueConfig.timezone);
  }
}
