/* eslint-disable @angular-eslint/no-host-metadata-property */
import { formatDate, ɵgetDOM as getDOM } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, Optional, Renderer2 } from '@angular/core';
import {
  AbstractControl,
  COMPOSITION_BUFFER_MODE,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { ApiModelValueConverter, DirectiveDateConfig, StandardModelValueConverters } from './date-configurator';
import { parseDate } from '../../parsers/date-parser.service';
import { DefaultDateModelValueConverter } from './DefaultDateModelValueConverter';
import { DefaultIsoStringModelValueConverter } from './DefaultIsoStringModelValueConverter';
import { DefaultNumberModelValueConverter } from './DefaultNumberModelValueConverter';
import { DefaultFormattedModelValueConverter } from './DefaultFormattedModelValueConverter';

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
function isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

@Directive({
  selector: '[aNgDate]',
  // host: {
  //   '(input)': '$any(this)._handleInput($event.target.value)',
  //   '(blur)': '$any(this)._handleBlur()',
  //   '(compositionstart)': '$any(this)._compositionStart()',
  //   '(compositionend)': '$any(this)._compositionEnd($event.target.value)',
  // },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AnnotationDateDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AnnotationDateDirective),
      multi: true,
    },
  ],
})
export class AnnotationDateDirective implements ControlValueAccessor, Validator {
  private _composing = false;

  onChange: (value: any) => void; // Called on a value change
  onTouched: () => void; // Called if you care if the form was touched
  onValidatorChange: () => void; // Called on a validator change or re-validation;

  private config: DirectiveDateConfig = null;
  dtValue: Date = null; // interna premenna
  _ngValue: any = null; // premenna ktoru posielame do ngModel

  get ngValue() {
    return this._ngValue;
  }

  set ngValue(v: any) {
    // ignore if null - user is typing
    if (v == null) return;

    this._ngValue = v;
    this.onChange(this._ngValue);
    this.onTouched();
  }

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
  ) {
    if (this._compositionMode == null) {
      this._compositionMode = !isAndroid();
    }
  }

  // registration for ControlValueAccessor
  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  // registration for ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // registration for Validator
  registerOnValidatorChange?(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  writeValue(value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', this.valueFormatter(value));
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  // TODO - mfilo - 14.01.2021 -
  validate(control: AbstractControl): ValidationErrors | null {
    console.log(control);
    // return { invalid: true };
    return null;
  }

  @HostListener('blur')
  _handleBlur() {
    this.onTouched();
    // + moze byt custom funkcionalita
  }

  @HostListener('input', ['$event.target.value'])
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
  @HostListener('compositionend', ['$event.target.value'])
  _compositionEnd(value: any): void {
    this._composing = false;
    if (this._compositionMode) this.onChange(this.valueParser(value));
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Customization behavior & config

  @Input('aNgDate')
  set setConfig(val: DirectiveDateConfig) {
    this.config = {
      displayFormat: val.displayFormat,
      firstValueConverter: val.firstValueConverter,
      modelConverter: val.modelConverter || 'date',

      // TODO - mfilo - 14.01.2021 - locale, popup, timezone
      locale: val.locale || 'en-US',
      popup: val.popup || true,
      timezone: undefined,
    };
  }

  get modelConverter(): ApiModelValueConverter<any> {
    return this.handleConverterInput(this.config.modelConverter);
  }

  handleConverterInput(converter?: StandardModelValueConverters | ApiModelValueConverter<any>): ApiModelValueConverter<any> {
    return typeof converter === 'string' ? this.getConverter(converter) : converter;
  }

  getConverter(modelConverters: StandardModelValueConverters): ApiModelValueConverter<any> {
    switch (modelConverters) {
      case 'formatted':
        return DefaultFormattedModelValueConverter.INSTANCE;
      case 'date':
        return DefaultDateModelValueConverter.INSTANCE;
      case 'number-timestamp':
        return DefaultNumberModelValueConverter.INSTANCE;
      case 'string-iso-date':
        // TODO - mfilo - 14.01.2021 - format as const/static field
        this.config.dateFormat = 'YYYY-MM-dd';
        return DefaultFormattedModelValueConverter.INSTANCE;
      case 'string-iso-datetime':
        // TODO - mfilo - 14.01.2021 - format as const/static field
        this.config.dateFormat = 'YYYY-MM-ddTHH:mm';
        return DefaultFormattedModelValueConverter.INSTANCE;
      case 'string-iso-datetime-with-zone':
        return DefaultIsoStringModelValueConverter.INSTANCE;
      case 'string-iso-time':
        // TODO - mfilo - 14.01.2021 - format as const/static field
        this.config.dateFormat = 'HH:mm';
        return new DefaultFormattedModelValueConverter();
      case 'string-iso-time-with-zone':
        throw new Error('Converter not implemented error!');
      default:
        throw new Error('Unknown converter type!');
    }
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Value formatter & parsers
  // ngModel = string(iso) | Date | number
  // html = formatter = 'yyyy-mm-dd'
  // value sender '2012-12-30'  => 30.12.2012  (po uprave) 31.12.2020 => Date => do modelu '2020-12-31'
  // <input type='a-date' ngmodel='value1' [aDate]='{format: 'dd. MM'}' />
  // <input type='a-date' ngmodel='value1' [aDate]='{format: 'hh:mm'}' />

  valueFormatter(value: any): string {
    if (value === undefined || value === null) return '';

    // first time - parse ANY input to Date
    if (!this.dtValue && !this.ngValue && this.config?.firstValueConverter) {
      const converter = this.handleConverterInput(this.config.firstValueConverter);
      this.dtValue = converter.fromModel(value);
      this.ngValue = this.modelConverter.toModel(this.dtValue, null, this.config);
    } else {
      this.ngValue = value;
      this.dtValue = this.modelConverter.fromModel(value, this.config);
    }

    if (this.dtValue == null) return '';
    return formatDate(this.dtValue, this.config.displayFormat, this.config.locale, this.config.timezone);
  }

  valueParser(val: string): string | number | Date {
    if (!val) return null;
    if (!val.trim().length) return null;

    this.dtValue = parseDate(val, this.config.displayFormat, this.config.locale, this.dtValue);
    this.ngValue = this.modelConverter.toModel(this.dtValue, this.ngValue, this.config);

    return this.ngValue;
  }
}
