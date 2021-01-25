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
  ngDate: NgDateConfig;

  private control: AbstractControl;
  private _maxDate: any;
  @Input()
  set maxDate(v: any) {
    this._maxDate = v;

    // if maxDate has changed we have to rerun validation
    if (this.control) {
      this.validate(this.control);
      setTimeout(() => {
        this.control.updateValueAndValidity();
      });
    }
  }

  constructor(@Optional() @Inject(NG_DATEPICKER_CONF) private globalConf: NgDatepickerConf) {}

  validate(control: AbstractControl): ValidationErrors | null {
    // TODO - mfilo - 17.01.2021 - there should be a better way
    this.control = control;

    if (!this._maxDate) return null;

    const conf = NgDateDefaultConfig.fixConfig({
      ...(this.globalConf?.ngDateConfig ? this.globalConf.ngDateConfig : {}),
      ...(this.ngDate ? this.ngDate : {}),
    } as NgDateConfig);

    return NgDateValidators.maxDate(this._maxDate, conf)(control);
  }
}
