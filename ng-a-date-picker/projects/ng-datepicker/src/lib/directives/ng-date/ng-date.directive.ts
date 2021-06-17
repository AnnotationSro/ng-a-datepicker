import { formatDate, ɵgetDOM as getDOM } from '@angular/common';
import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BasicDateFormat } from '@annotation/ng-parse';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { ApiNgDateModelValueConverter, NgDateConfig, StandardModelValueConverters } from '../../model/ng-date-public.model';
import { PopupComponent } from '../../components/popup/popup.component';
import { NgDateConfigUtil } from '../../conf/ng-date.config.util';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';
import { NgDateDirectiveApi, NgDateValue } from './ng-date.directive.api';
import { ParseService } from '../../services/parse.service';

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
function isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

// TODO - mfilo - 15.01.2021 - checklist
//  - timezones
//  - time-step - napr cas bude zaokruhleny na 15min, ovplyvni aj kalendar popup

@Directive({
  selector: '[ngDate]',
  exportAs: 'ngDate',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgDateDirective),
      multi: true,
    },
  ],
  // host: {
  //   '(input)': '$any(this)._handleInput($event.target.value)',
  //   '(blur)': '$any(this)._handleBlur()',
  //   '(compositionstart)': '$any(this)._compositionStart()',
  //   '(compositionend)': '$any(this)._compositionEnd($event.target.value)',
  // },
})
export class NgDateDirective implements ControlValueAccessor, HasNgDateConf, NgDateDirectiveApi, OnInit, OnDestroy {
  @Input() disabled: boolean;

  @Input() disablePopup: boolean = false;
  @Input() disableSelectOnFocus: boolean = false;
  @Input() keepOpen: boolean = false;
  @Input() timeStep: number = 1;

  private _minDate: any;
  @Input() set minDate(val: any) {
    this._minDate = val;

    if (this.popupComponent) {
      this.popupComponent.instance.minDate = this.convertNgValueToDtValue(val, undefined);
    }
  }

  get minDate() {
    return this._minDate;
  }

  private _maxDate: any;
  @Input() set maxDate(val: any) {
    this._maxDate = val;

    if (this.popupComponent) {
      this.popupComponent.instance.maxDate = this.convertNgValueToDtValue(val, undefined);
    }
  }

  get maxDate() {
    return this._maxDate;
  }

  private popupComponent: ComponentRef<PopupComponent> | null = null;

  @Input('ngDate')
  ngDateConfig: NgDateConfig | BasicDateFormat = null;

  @Input('ngDateModelConverter')
  ngDateModelConverterConfig: StandardModelValueConverters | ApiNgDateModelValueConverter<any> = null;

  dtValue: Date | null = null; // internal variable with date value
  private ngValue: any = null;

  onChange: (value: any) => void; // Called on a value change
  onTouched: () => void; // Called if you care if the form was touched

  private _composing = false;

  // get ngValue() {
  //   return this._ngValue;
  // }
  //
  // set ngValue(v: any) {
  //   // ignore if null - user is typing
  //   if (v == null) return;
  //
  //   this._ngValue = v;
  //   this.onChange(this._ngValue);
  // }

  constructor(
    private _renderer: Renderer2,
    private elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private parse: ParseService,
    @Optional() @Inject(NG_DATEPICKER_CONF) public ngDatepickerConf: NgDatepickerConf,
    @Inject(LOCALE_ID) public locale: string,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
  ) {
    if (this._compositionMode == null) {
      this._compositionMode = !isAndroid();
    }
  }

  ngOnInit() {
    if (!this.disablePopup) {
      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(PopupComponent);
      this.popupComponent = this._viewContainerRef.createComponent<PopupComponent>(componentFactory);
      this.popupComponent.instance.ngDateDirective = this;

      // browser autocomplete would overlay popup
      this._renderer.setProperty(this.elementRef.nativeElement, 'autocomplete', 'off');

      this.popupComponent.instance.keepOpen = this.keepOpen;
      this.popupComponent.instance.timeStep = this.timeStep;

      if (this.minDate) {
        this.popupComponent.instance.minDate = this.minDate;
      }

      if (this.maxDate) {
        this.popupComponent.instance.maxDate = this.maxDate;
      }
    }
  }

  ngOnDestroy() {
    if (this.popupComponent) {
      this.popupComponent.destroy();
    }
  }

  addEventListenerToInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (`${this.disabled}` === 'true') {
      return;
    }

    this.elementRef.nativeElement.addEventListener(type, listener, options);
  }

  removeEventListenerFromInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    this.elementRef.nativeElement.removeEventListener(type, listener, options);
  }

  getInputHeight(): number {
    return (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect().height;
  }

  // registration for ControlValueAccessor
  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  // registration for ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Writes a new value to the element.
   * This method is called by the forms API to write to the view when programmatic changes from model to view are requested.
   * Write a value to the element
   * The following example writes a value to the native DOM element.
   * writeValue(value: any): void {
   *   this._renderer.setProperty(this.elementRef.nativeElement, 'value', value);
   * }
   * Params:
   * obj – The new value for the element
   * @description
   *
   * @usageNotes
   */
  writeValue(value: any): void {
    this._renderer.setProperty(this.elementRef.nativeElement, 'value', this.valueFormatter(value));

    if (this.popupComponent?.instance) {
      this.popupComponent.instance.val = this.readValue().dtValue;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('focus', ['$event.target.value'])
  _handleFocus() {
    if (!this.disableSelectOnFocus) {
      this.elementRef.nativeElement.select();
    }
  }

  @HostListener('blur', ['$event.target.value'])
  _handleBlur(value) {
    if (!this.popupComponent?.instance?.isOpen) {
      this.onTouched();
    }

    // toto chceme zavolat 'on blur' aby sme opravili format napr: 1.1.2020 -> 01.01.2020
    const parsedDate = this.valueParser(value);
    this.dtValue = parsedDate.dtValue;
    this.ngValue = parsedDate.ngValue;

    if (!this.dtValue) {
      this.writeValue('');
      this.onChange(this.ngValue); // ngValue should be null
      return;
    }

    this.onChange(this.ngValue);
    const val = NgDateConfigUtil.resolveModelConverter(this).toModel(this.dtValue, this.ngValue);
    this.writeValue(val);
  }

  // @HostListener('input', ['$event.target.value'])
  // _handleInput(value: any): void {
  //   if (!this._compositionMode || (this._compositionMode && !this._composing)) {
  //     // this.onChange(this.valueParser(value));
  //   }
  // }

  /** @internal */
  @HostListener('compositionstart')
  _compositionStart(): void {
    this._composing = true;
  }

  /** @internal */
  @HostListener('compositionend', ['$event.target.value'])
  _compositionEnd(value: any): void {
    this._composing = false;
    if (this._compositionMode) this.onChange(this.valueParser(value).ngValue);
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Converters only
  // 1) convert(ngValue, dtValue/old) => dtValue/new
  private convertNgValueToDtValue(newNgValue: any, dtValue: Date): Date | null {
    if (!newNgValue) {
      return null;
    }

    return NgDateConfigUtil.resolveModelConverter(this).fromModel(
      newNgValue,
      dtValue,
      NgDateConfigUtil.resolveHtmlValueConfig(this)
    );
  }

  // 2) convert(dtValue) => htmlValue
  private convertDtValueToHtmlValue(dtValue: Date): string {
    if (dtValue == null) {
      return '';
    }
    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(this);
    return formatDate(dtValue, htmlValueConfig.displayFormat, htmlValueConfig.locale, htmlValueConfig.timezone);
  }

  // 3) convert(htmlValue, dtValue/old) => dtValue/new
  private convertHtmlValueToDtValue(htmlValue: string, dtValue: Date): Date | null {
    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(this);
    return this.parse.parseDate(htmlValue, htmlValueConfig.displayFormat, htmlValueConfig.locale, dtValue);
  }

  // 4) convert(dtValue, ngValue/old) => ngValue/new
  private convertDtValueToNgModel(dtValue: Date, ngValue: any): any {
    return NgDateConfigUtil.resolveModelConverter(this).toModel(dtValue, ngValue, NgDateConfigUtil.resolveHtmlValueConfig(this));
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Customization behavior & config

  private valueFormatter(ngValue: any): string {
    this.ngValue = ngValue;
    // 1) (newNgValue, dtValue/old) => dtValue
    this.dtValue = this.convertNgValueToDtValue(this.ngValue, this.dtValue);

    // 2) dtValue => htmlValue
    return this.convertDtValueToHtmlValue(this.dtValue);
  }

  private valueParser(htmlValue: string): { dtValue: Date; ngValue: string } {
    // TODO - mfilo - 27.01.2021 - @psl - check me - bez tohto prazdny string je 1.1.1970
    if (!htmlValue.trim()) {
      return { dtValue: null, ngValue: '' };
    }

    // 1) (htmlValue, dtValue) => dtValue
    const dtValue = this.convertHtmlValueToDtValue(htmlValue, this.dtValue);
    dtValue?.setMinutes(Math.round(dtValue.getMinutes() / this.timeStep) * this.timeStep);

    // 2) (dtValue, ngValue) => ngValue
    const ngValue = this.convertDtValueToNgModel(dtValue, this.ngValue);
    return { ngValue, dtValue };
  }

  public readValue(): NgDateValue {
    return {
      dtValue: this.dtValue,
      ngValue: this.ngValue,
    };
  }

  public changeValue(value: Date) {
    // 1) dtValue => htmlValue (update view)
    const newHtmlValue = (this.convertDtValueToHtmlValue(value) || '').trim();
    const oldHtmlValue = (this.elementRef.nativeElement.value || '').trim();
    if (newHtmlValue === oldHtmlValue) return; // no change is there

    // 2) update values
    const parsed = this.valueParser(newHtmlValue);
    this.dtValue = parsed.dtValue;
    this.ngValue = parsed.ngValue;

    this.onChange(this.ngValue);
    this.writeValue(this.ngValue);
    this.onTouched();
  }
}
