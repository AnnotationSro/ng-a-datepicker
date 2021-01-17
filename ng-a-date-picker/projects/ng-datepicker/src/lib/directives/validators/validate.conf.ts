import { AbstractControl, ValidatorFn } from '@angular/forms';
import { NgDateConfig } from '../../ng-date.model';
import { getConverter } from '../../ng-date.util';

export type NgMaxDateError = { maxDate: { rejectedValue: any } } | null;
export type NgMinDateError = { minDate: { rejectedValue: any } } | null;

export class NgDateValidators {
  static minDate = (minDate: any, ngDateConfig: NgDateConfig): ValidatorFn => (control: AbstractControl): NgMinDateError => {
    if (!control.value) return null;

    const minAsDate = +NgDateValidators.valueToDate(minDate, ngDateConfig);
    const valueAsDate = +NgDateValidators.valueToDate(control.value, ngDateConfig);

    return valueAsDate < minAsDate ? { minDate: { rejectedValue: control.value } } : null;
  };

  static maxDate = (maxDate: any, ngDateConfig: NgDateConfig): ValidatorFn => (control: AbstractControl): NgMaxDateError => {
    if (!control.value) return null;

    const maxAsDate = +NgDateValidators.valueToDate(maxDate, ngDateConfig);
    const valueAsDate = +NgDateValidators.valueToDate(control.value, ngDateConfig);

    return valueAsDate > maxAsDate ? { maxDate: { rejectedValue: control.value } } : null;
  };

  private static valueToDate(value: any, config: NgDateConfig): Date {
    const converter = getConverter(config.modelConverter, config);

    return converter.fromModel(value, config);
  }
}
