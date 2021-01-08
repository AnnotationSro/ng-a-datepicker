/* eslint-disable */
import {ɵgetDOM as getDOM} from '@angular/common';
import {Directive, ElementRef, forwardRef, HostListener, Inject, OnInit, Optional, Renderer2} from '@angular/core';
import {COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR, NgModel} from "@angular/forms";

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
function _isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}


export const MY_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TestDirectiveDirective),
  multi: true
};
@Directive({
//  'input:not([type=checkbox])[formControlName],
//  textarea[formControlName],
//  input:not([type=checkbox])[formControl],
//  textarea[formControl],
//  input:not([type=checkbox])[ngModel],
//  textarea[ngModel],
//  [ngDefaultControl]',
  selector: '[aDateTest]',
  host: {
    '(input)': '$any(this)._handleInput($event.target.value)',
    '(blur)': '$any(this)._handleBlur()',
    '(compositionstart)': '$any(this)._compositionStart()',
    '(compositionend)': '$any(this)._compositionEnd($event.target.value)'
  },
  providers: [MY_VALUE_ACCESSOR]
})
export class TestDirectiveDirective implements ControlValueAccessor {

  private _composing = false;
  constructor(private _renderer: Renderer2, private _elementRef: ElementRef, @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean) {
    if (this._compositionMode == null) {
      this._compositionMode = !_isAndroid();
    }
  }

  writeValue(value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', this.valueFormatter(value));
  }

  onChange = (_: any) => {};
  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  onTouched = () => {};
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  _handleBlur() {
    this.onTouched();
    // + moze byt custom funkcionalita
  }

  /** @internal */
  _handleInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(this.valueParser(value));
    }
  }

  /** @internal */
  _compositionStart(): void {
    this._composing = true;
  }

  /** @internal */
  _compositionEnd(value: any): void {
    this._composing = false;
    this._compositionMode && this.onChange(this.valueParser(value));
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Value formatter & parsers
  static cnt = 1;
  private i : number = TestDirectiveDirective.cnt++;
  // value sender
  valueFormatter(value: any): string {
    const normalizedValue = value == null ? '' : value;
    return normalizedValue + '|ukazka-' + this.i;
  }
  valueParser(val: string): string|number|Date {
    if (!val) return null;
    if (!val.trim().length) return null;
    val = val.split('|')[0];
    return val;
  }

}
