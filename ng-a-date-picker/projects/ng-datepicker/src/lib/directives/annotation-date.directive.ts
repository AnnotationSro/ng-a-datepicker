/* eslint-disable @angular-eslint/no-host-metadata-property */
import { ɵgetDOM as getDOM } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Inject, Optional, Renderer2 } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  /// Value formatter & parsers
  // value sender
  valueFormatter(value: any): string {
    const normalizedValue = value == null ? '' : value;
    return `${normalizedValue}`;
  }

  valueParser(val: string): string | number | Date {
    if (!val) return null;
    if (!val.trim().length) return null;
    return val.split('|')[0];
  }
}
