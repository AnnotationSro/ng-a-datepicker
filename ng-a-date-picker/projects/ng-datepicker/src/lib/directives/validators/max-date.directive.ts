import { Directive, forwardRef, Inject, Input, LOCALE_ID, Optional } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { NgDateValidators } from './validate.conf';
import {
  ApiNgDateModelValueConverter,
  BasicDateFormat,
  NgDateConfig,
  StandardModelValueConverters,
} from '../../model/ng-date-public.model';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';

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
export class MaxDateDirective implements Validator, HasNgDateConf {
  @Input('ngDate')
  ngDateConfig: BasicDateFormat | NgDateConfig = null;

  @Input('ngDateModelConverter')
  ngDateModelConverterConfig: StandardModelValueConverters | ApiNgDateModelValueConverter<any> = null;

  constructor(
    @Optional() @Inject(NG_DATEPICKER_CONF) public ngDatepickerConf: NgDatepickerConf,
    @Inject(LOCALE_ID) public locale: string
  ) {}

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

  validate(control: AbstractControl): ValidationErrors | null {
    // TODO - mfilo - 17.01.2021 - there should be a better way
    this.control = control;

    if (!this._maxDate) return null;

    return NgDateValidators.maxDate(this._maxDate, this)(control);
  }
}
