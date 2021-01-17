import { Directive, forwardRef, Inject, Input, Optional } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { NgDateValidators } from './validate.conf';
import { NgDateConfig } from '../../ng-date.model';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { NgDateDefaultConfig } from '../../ng-date.util';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[maxDate]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MaxDateDirective),
      multi: true,
    },
  ],
})
export class MaxDateDirective implements Validator {
  @Input()
  aNgDate: NgDateConfig;

  @Input()
  maxDate: any;

  constructor(@Optional() @Inject(NG_DATEPICKER_CONF) private globalConf: NgDatepickerConf) {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (typeof this.maxDate === 'undefined') return null;

    const conf = NgDateDefaultConfig.fixConfig({
      ...(this.globalConf?.ngDateConfig ? this.globalConf.ngDateConfig : {}),
      ...(this.aNgDate ? this.aNgDate : {}),
    } as NgDateConfig);

    return NgDateValidators.maxDate(this.maxDate, conf)(control);
  }
}
