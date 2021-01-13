/* eslint-disable @angular-eslint/no-host-metadata-property */
import {formatDate, ɵgetDOM as getDOM} from '@angular/common';
import {Directive, ElementRef, forwardRef, HostListener, Inject, Input, Optional, Renderer2} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {DirectiveDateConfig} from "./date-configurator";
import {parseDate, toDate} from "../../parsers/date-parser.service";
import {ApiModelValueConverter} from "./ApiModelValueConverter";
import {ignoreElements} from "rxjs/operators";

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function _isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

export const MY_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  useExisting: forwardRef(() => AnnotationDateDirective),
  multi: true,
};

@Directive({
  selector: '[aNgDate]',
  // host: {
  //   '(input)': '$any(this)._handleInput($event.target.value)',
  //   '(blur)': '$any(this)._handleBlur()',
  //   '(compositionstart)': '$any(this)._compositionStart()',
  //   '(compositionend)': '$any(this)._compositionEnd($event.target.value)',
  // },
  providers: [MY_VALUE_ACCESSOR],
})
export class AnnotationDateDirective implements ControlValueAccessor {
  private _composing = false;
  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
  ) {
    if (this._compositionMode == null) {
      this._compositionMode = !_isAndroid();
    }
  }

  writeValue(value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', this.valueFormatter(value));
  }

  onChange: (value: any) => void = () => {};
  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  onTouched: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('blur')
  _handleBlur() {
    this.onTouched();
    // + moze byt custom funkcionalita
  }

  @HostListener('input')
  _handleInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(this.valueParser(value));
    }
  }

  /** @internal */
  @HostListener('compositionstart')
  _compositionStart(): void {
    this._composing = true;
  }

  /** @internal */
  @HostListener('compositionend')
  _compositionEnd(value: any): void {
    this._composing = false;
    if (this._compositionMode) this.onChange(this.valueParser(value));
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Customization behavior & config

  private config: DirectiveDateConfig = null;

  @Input('aNgDate')
  set setConfig(val: string | DirectiveDateConfig) {
    this.config = {format: val+''};
  }
  get modelConverter():ApiModelValueConverter<any> {
    // @ts-ignore
    return this.config.modelConverter;
  }

  dtValue: Date = null;

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Value formatter & parsers
  // ngModel = string(iso) | Date | number
  // html = formatter = 'yyyy-mm-dd'
  // value sender '2012-12-30'  => 30.12.2012  (po uprave) 31.12.2020 => Date => do modelu '2020-12-31'
  // <input type='a-date' ngmodel='value1' [aDate]='{format: 'dd. MM'}' />
  // <input type='a-date' ngmodel='value1' [aDate]='{format: 'hh:mm'}' />
  ngValue: any = null;
  valueFormatter(value: any): string {
    this.ngValue = value;
    this.dtValue = this.modelConverter.fromModel(value);
    if (this.dtValue == null) return '';
    return formatDate(this.dtValue, this.config.format, this.config.locale, this.config.timezone);
  }

  valueParser(val: string): string | number | Date {
    if (!val) return null;
    if (!val.trim().length) return null;

    this.dtValue = parseDate(val, this.config.format, undefined, this.dtValue);
    let ngModelValue = this.modelConverter.toModel(this.dtValue, this.ngValue);
    //convert : value => ngModel
    return this.dtValue;
  }
}
