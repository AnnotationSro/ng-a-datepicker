import { Directive, forwardRef, Inject, Input, Optional } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { NgDateValidators } from './validate.conf';
import { NgDateDefaultConfig } from '../../ng-date.util';
import { NgDateConfig } from '../../ng-date.model';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[minDate]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinDateDirective),
      multi: true,
    },
  ],
})
export class MinDateDirective implements Validator {
  @Input()
  aNgDate: NgDateConfig;

  private control: AbstractControl;
  private _minDate: any;
  @Input()
  set minDate(v: any) {
    this._minDate = v;

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

    if (!this._minDate) return null;

    const conf = NgDateDefaultConfig.fixConfig({
      ...(this.globalConf?.ngDateConfig ? this.globalConf.ngDateConfig : {}),
      ...(this.aNgDate ? this.aNgDate : {}),
    } as NgDateConfig);

    return NgDateValidators.minDate(this._minDate, conf)(control);
  }
}
