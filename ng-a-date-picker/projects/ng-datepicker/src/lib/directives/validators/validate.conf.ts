import { AbstractControl, ValidatorFn } from '@angular/forms';
import { formatDate } from '@angular/common';
import { NgDateConfig } from '../../ng-date.model';
import { getConverter } from '../../ng-date.util';

export type NgDateMaxValidationError = {
  maxDate: { rejectedValue: any; maxDateAllowedFormatted: string; maxDateAllowed: string };
} | null;
export type NgDateMinValidationError = {
  minDate: { rejectedValue: any; minDateAllowedFormatted: string; minDateAllowed: string };
} | null;

export class NgDateValidators {
  static minDate(minDate: any, ngDateConfig: NgDateConfig): ValidatorFn {
    function valFn(control: AbstractControl): NgDateMinValidationError {
      if (!control.value) return null;

      const minAsDate = +NgDateValidators.valueToDate(minDate, ngDateConfig);
      const valueAsDate = +NgDateValidators.valueToDate(control.value, ngDateConfig);

      return valueAsDate < minAsDate
        ? {
            minDate: {
              rejectedValue: control.value,
              minDateAllowed: minDate,
              minDateAllowedFormatted: NgDateValidators.valueToDisplayFormat(minDate, ngDateConfig),
            },
          }
        : null;
    }

    return valFn;
  }

  static maxDate(maxDate: any, ngDateConfig: NgDateConfig): ValidatorFn {
    function valFn(control: AbstractControl): NgDateMaxValidationError {
      if (!control.value) return null;

      const maxAsDate = +NgDateValidators.valueToDate(maxDate, ngDateConfig);
      const valueAsDate = +NgDateValidators.valueToDate(control.value, ngDateConfig);

      return valueAsDate > maxAsDate
        ? {
            maxDate: {
              rejectedValue: control.value,
              maxDateAllowed: maxDate,
              maxDateAllowedFormatted: NgDateValidators.valueToDisplayFormat(maxDate, ngDateConfig),
            },
          }
        : null;
    }

    return valFn;
  }

  private static valueToDate(value: any, config: NgDateConfig): Date {
    const converter = getConverter(config.modelConverter, config);

    return converter.fromModel(value, config);
  }

  private static valueToDisplayFormat(value: any, config: NgDateConfig): string {
    return formatDate(value, config.displayFormat, config.locale, config.timezone);
  }
}
