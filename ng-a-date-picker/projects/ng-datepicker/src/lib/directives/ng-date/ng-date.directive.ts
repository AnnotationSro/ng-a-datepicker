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
  Optional,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { parseDate } from '../../parsers/parse-date';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import {
  ApiNgDateModelValueConverter,
  BasicDateFormat,
  NgDateConfig,
  StandardModelValueConverters,
} from '../../model/ng-date-public.model';
import { PopupComponent } from '../../components/popup/popup.component';
import { NgDateConfigUtil } from '../../conf/ng-date.config.util';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';
import { NgDateDirectiveApi, NgDateValue } from './ng-date.directive.api';

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
//  - timezones
//  - directive single field inputs for config
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
export class NgDateDirective implements ControlValueAccessor, HasNgDateConf, NgDateDirectiveApi {
  dtValue: Date = null; // internal variable with date value
  @Input() disablePopup: boolean = false;
  private popupComponent: ComponentRef<PopupComponent> = null;

  @Input('ngDate')
  ngDateConfig: NgDateConfig | BasicDateFormat = null;

  @Input('ngDateModelConverter')
  ngDateModelConverterConfig: StandardModelValueConverters | ApiNgDateModelValueConverter<any> = null;

  private ngValue: any = null;

  /// ///////////////

  private _composing = false;

  onChange: (value: any) => void; // Called on a value change
  onTouched: () => void; // Called if you care if the form was touched

  // _ngValue: any = null; // premenna ktoru posielame do ngValue
  //
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

  // get elementRef(): ElementRef {
  //   return this.elementRef;
  // }

  constructor(
    private _renderer: Renderer2,
    private elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    @Optional() @Inject(NG_DATEPICKER_CONF) public ngDatepickerConf: NgDatepickerConf,
    @Inject(LOCALE_ID) public locale: string,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
  ) {
    if (this._compositionMode == null) {
      this._compositionMode = !isAndroid();
    }

    if (!this.disablePopup) {
      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(PopupComponent);
      this.popupComponent = this._viewContainerRef.createComponent<PopupComponent>(componentFactory);
      this.popupComponent.instance.ngDateDirective = this;

      // autocomple would overlay popup
      this._renderer.setProperty(this.elementRef.nativeElement, 'autocomplete', 'off');
    }
  }

  addEventListenerToInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.elementRef.nativeElement.addEventListener(type, listener, options);
  }

  removeEventListenerFromInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    this.elementRef.nativeElement.removeEventListener(type, listener, options);
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
      this.popupComponent.instance.val = this.readValue();
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('blur')
  _handleBlur() {
    if (!this.popupComponent?.instance?.isOpen) {
      this.onTouched();
    }
    //
    // if (!this.dtValue) {
    //   // clean user input
    //   this.writeValue('');
    //   return;
    // }
    //
    // const val = ConfigUtil.resolveModelConverter(this.modelConfig, this.config, this.ngDatepickerConf).toModel(this.dtValue, this._ngValue);
    // this.writeValue(val);
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
  /// Converters only
  // 1) convert(ngValue, dtValue/old) => dtValue/new
  private convertNgValueToDtValue(newNgValue: any, dtValue: Date): Date {
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
  private convertHtmlValueToDtValue(htmlValue: string, dtValue: Date): Date {
    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(this);
    return parseDate(htmlValue, htmlValueConfig.displayFormat, htmlValueConfig.locale, dtValue);
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

  private valueParser(htmlValue: string): any {
    // 1) (htmlValue, dtValue) => dtValue
    this.dtValue = this.convertHtmlValueToDtValue(htmlValue, this.dtValue);

    // 2) (dtValue, ngValue) => ngValue
    this.ngValue = this.convertDtValueToNgModel(this.dtValue, this.ngValue);
    return this.ngValue;
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
    if (newHtmlValue == oldHtmlValue) return; // no change is there

    // 2) update values
    this._renderer.setProperty(this.elementRef.nativeElement, 'value', newHtmlValue);
    this.onChange(this.valueParser(newHtmlValue));
    this.onTouched();
  }
}
