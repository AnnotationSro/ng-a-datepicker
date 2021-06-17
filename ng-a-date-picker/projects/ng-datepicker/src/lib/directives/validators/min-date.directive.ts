import { Directive, forwardRef, Inject, Input, LOCALE_ID, Optional } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { BasicDateFormat } from '@annotation/ng-parse';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { NgDateValidators } from './validate.conf';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';
import { ApiNgDateModelValueConverter, NgDateConfig, StandardModelValueConverters } from '../../model/ng-date-public.model';

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
export class MinDateDirective implements Validator, HasNgDateConf {
  @Input('ngDate')
  ngDateConfig: BasicDateFormat | NgDateConfig = null;

  @Input('ngDateModelConverter')
  ngDateModelConverterConfig: StandardModelValueConverters | ApiNgDateModelValueConverter<any> = null;

  constructor(
    @Optional() @Inject(NG_DATEPICKER_CONF) public ngDatepickerConf: NgDatepickerConf,
    @Inject(LOCALE_ID) public locale: string
  ) {}

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

  validate(control: AbstractControl): ValidationErrors | null {
    // TODO - mfilo - 17.01.2021 - there should be a better way
    this.control = control;

    if (!this._minDate) return null;

    return NgDateValidators.minDate(this._minDate, this)(control);
  }
}
