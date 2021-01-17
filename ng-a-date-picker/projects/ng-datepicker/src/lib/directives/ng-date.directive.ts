import { formatDate, ɵgetDOM as getDOM } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, Optional, Renderer2 } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { parseDate } from '../parsers/parse-date';
import { NG_DATEPICKER_CONF } from '../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../conf/ng-datepicker.conf';
import { NgDateConfig, NgDateModelValueConverter, StandardModelValueConverters } from '../ng-date.model';
import { getConverter, NgDateDefaultConfig } from '../ng-date.util';

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
function isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

// TODO - mfilo - 15.01.2021 - checklist
//  - locale provider
//  - directive single field input na config hodnoty
//  - nova direktiva na validovanie
//  - casove pasma
//  - popup
//  - time-step - napr cas bude zaokruhleny na 15min, ovplyvni aj kalendar popup
//  -

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
      useExisting: forwardRef(() => NgDateDirective),
      multi: true,
    },
  ],
})
export class NgDateDirective implements ControlValueAccessor {
  private _composing = false;

  onChange: (value: any) => void; // Called on a value change
  onTouched: () => void; // Called if you care if the form was touched

  private config: NgDateConfig = null;
  private hasConfig: boolean = false;

  dtValue: Date = null; // interna premenna
  _ngValue: any = null; // premenna ktoru posielame do ngModel

  // TODO - mfilo - 15.01.2021 - toto by bolo vhodne tiez
  // @Input('firstValueConverter') firstValueConverterInput: DirectiveDateConfig['firstValueConverter'];
  // @Input('modelConverter') modelConverterInput: DirectiveDateConfig['modelConverter'];
  // @Input('displayFormat') displayFormatInput: DirectiveDateConfig['displayFormat'];
  // @Input('dateFormat') dateFormatInput: DirectiveDateConfig['dateFormat'];
  // @Input('timezone') timezoneInput: DirectiveDateConfig['timezone'];
  // @Input('locale') localeInput: DirectiveDateConfig['locale'];
  // @Input('popup') popupInput: DirectiveDateConfig['popup'];

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
    @Optional() @Inject(NG_DATEPICKER_CONF) private ngDatepickerConf: NgDatepickerConf,
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

  writeValue(value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', this.valueFormatter(value));
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('blur')
  _handleBlur() {
    this.onTouched();

    if (!this.dtValue) {
      // clean user input
      this.writeValue('');
      return;
    }

    const val = this.modelConverter.toModel(this.dtValue, null, this.config);
    this.writeValue(val);
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
  set setConfig(val: NgDateConfig) {
    this.hasConfig = true;
    this.config = {} as NgDateConfig;
    // set defaults from ModuleConf if exists
    if (this.ngDatepickerConf?.ngDateConfig) {
      // TODO - mfilo - 15.01.2021 - @psl
      //  - pozri sem pls, keby spravim len `this.config=this.ngDatepickerConf.ngDateConf`
      //    tak zdielame jeden objekt pre vsetky komponenty co je blbost

      // we cant use JSON.parse(JSON.stringify()) to prevent reference to global config, because modelConverter can be a class instance
      this.config.popup = this.ngDatepickerConf.ngDateConfig.popup;
      this.config.firstValueConverter = this.ngDatepickerConf.ngDateConfig.firstValueConverter;
      this.config.modelConverter = this.ngDatepickerConf.ngDateConfig.modelConverter;
      this.config.dateFormat = this.ngDatepickerConf.ngDateConfig.dateFormat;
      this.config.displayFormat = this.ngDatepickerConf.ngDateConfig.displayFormat;
      this.config.timezone = this.ngDatepickerConf.ngDateConfig.timezone;
      this.config.locale = this.ngDatepickerConf.ngDateConfig.locale;
    }

    // fill and overwrite ModuleConf values from aNgDate input
    if (val?.popup) this.config.popup = val.popup;
    if (val?.firstValueConverter) this.config.firstValueConverter = val.firstValueConverter;
    if (val?.modelConverter) this.config.modelConverter = val.modelConverter;
    if (val?.dateFormat) this.config.dateFormat = val.dateFormat;
    if (val?.displayFormat) this.config.displayFormat = val.displayFormat;
    if (val?.timezone) this.config.timezone = val.timezone;
    if (val?.locale) this.config.locale = val.locale;

    // console.warn(this.popupInput);
    // console.warn(this.firstValueConverterInput);
    // console.warn(this.modelConverterInput);
    // console.warn(this.dateFormatInput);
    // console.warn(this.displayFormatInput);
    // console.warn(this.timezoneInput);
    // console.warn(this.localeInput);

    this.config = NgDateDefaultConfig.fixConfig(this.config);
  }

  get modelConverter(): NgDateModelValueConverter<any> {
    return this.handleConverterInput(this.config.modelConverter);
  }

  handleConverterInput(
    converter?: StandardModelValueConverters | NgDateModelValueConverter<any>
  ): NgDateModelValueConverter<any> {
    return typeof converter === 'string' ? getConverter(converter, this.config) : converter;
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
      this.config.firstValueConverter = null;
    } else {
      this.ngValue = value;
      this.dtValue = this.modelConverter.fromModel(value, this.config);
    }

    if (this.dtValue == null) return '';
    return formatDate(this.dtValue, this.config.displayFormat, this.config.locale, this.config.timezone);
  }

  valueParser(val: string): string | number | Date {
    if (!val || !val.trim().length) {
      this.dtValue = null;
      this.ngValue = null;
      return this.ngValue;
    }

    this.dtValue = parseDate(val, this.config.displayFormat, this.config.locale, this.dtValue);

    if (!this.dtValue) {
      this.ngValue = null;
    } else {
      this.ngValue = this.modelConverter.toModel(this.dtValue, this.ngValue, this.config);
    }

    return this.ngValue;
  }
}
