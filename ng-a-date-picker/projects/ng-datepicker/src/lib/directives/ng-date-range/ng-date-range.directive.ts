import { formatDate, ɵgetDOM as getDOM } from '@angular/common';
import {
  ComponentRef,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BasicDateFormat } from '@annotation/ng-parse';
import { NG_DATEPICKER_CONF } from '../../conf/ng-datepicker.conf.token';
import { NgDatepickerConf } from '../../conf/ng-datepicker.conf';
import { NgDateConfig } from '../../model/ng-date-public.model';
import { ApiNgDateRangeModelValueConverter, DateRange, StandardRangeModelValueConverters } from '../../model/ng-date-range-public.model';
import { DefaultDateRangeModelValueConverter } from '../../converters/DefaultDateRangeModelValueConverter';
import { DefaultFormattedRangeModelValueConverter } from '../../converters/DefaultFormattedRangeModelValueConverter';
import { RangePopupComponent } from '../../components/popup/range-popup.component';
import { ModernRangePopupComponent } from '../../components/popup/modern-range-popup.component';
import { RangePopupBaseComponent } from '../../components/popup/range-popup-base.component';
import { NgDateConfigUtil } from '../../conf/ng-date.config.util';
import { HasNgDateConf } from '../../conf/has-ng-date-conf';
import { NgDateRangeDirectiveApi, NgDateRangeValue } from './ng-date-range.directive.api';
import { ParseService } from '../../services/parse.service';
import { createClearButton, updateClearButtonVisibility } from '../ng-date/clear-button.util';

/**
 * We must check whether the agent is Android because composition events
 * behave differently between iOS and Android.
 */
function isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

@Directive({
  selector: '[ngDateRange]',
  exportAs: 'ngDateRange',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgDateRangeDirective),
      multi: true,
    },
  ],
})
export class NgDateRangeDirective implements ControlValueAccessor, HasNgDateConf, NgDateRangeDirectiveApi, OnInit, OnDestroy, OnChanges {
  @Input() disabled: boolean;

  @Input() disablePopup: boolean = false;
  @Input() disableSelectOnFocus: boolean = false;
  @Input() keepOpen: boolean = false;
  @Input() showActionButtons: boolean = false;
  @Input() appendTo: string;
  @Input() clearable: boolean = false;
  @Input() modernTheme: boolean = false;
  @Input() rangeSeparator: string = ' - ';

  private static idCounter = 0;
  private popupId = `ng-date-range-popup-${NgDateRangeDirective.idCounter++}`;
  private clearBtnEl: HTMLElement | null = null;

  private _minDate: any;
  @Input() set minDate(val: any) {
    this._minDate = val;

    if (this.popupComponent) {
      this.popupComponent.instance.minDate = val ? this.parse.toDate(val) : undefined;
    }
  }

  get minDate() {
    return this._minDate;
  }

  private _maxDate: any;
  @Input() set maxDate(val: any) {
    this._maxDate = val;

    if (this.popupComponent) {
      this.popupComponent.instance.maxDate = val ? this.parse.toDate(val) : undefined;
    }
  }

  get maxDate() {
    return this._maxDate;
  }

  private popupComponent: ComponentRef<RangePopupBaseComponent> | null = null;

  // displayFormat for each endpoint reuses the exact same resolution as the single-date directive
  @Input('ngDateRange')
  ngDateConfig: NgDateConfig | BasicDateFormat = null;

  @Input('ngDateRangeModelConverter')
  rangeModelConverterConfig: StandardRangeModelValueConverters | ApiNgDateRangeModelValueConverter<any> = null;

  dtValue: DateRange = { start: null, end: null };
  private ngValue: any = null;

  onChange: (value: any) => void;
  onTouched: () => void;

  private _composing = false;

  constructor(
    private _renderer: Renderer2,
    private elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
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
      const popupCtor = this.modernTheme ? ModernRangePopupComponent : RangePopupComponent;
      this.popupComponent = this._viewContainerRef.createComponent(popupCtor);
      this.popupComponent.instance.ngDateRangeDirective = this;

      // browser autocomplete would overlay popup
      this._renderer.setProperty(this.elementRef.nativeElement, 'autocomplete', 'off');

      this.popupComponent.instance.keepOpen = this.keepOpen;
      this.popupComponent.instance.showActionButtons = this.showActionButtons;
      this.popupComponent.instance.appendTo = this.appendTo;
      this.popupComponent.instance.popupId = this.popupId;

      this._renderer.setAttribute(this.elementRef.nativeElement, 'aria-haspopup', 'dialog');
      this._renderer.setAttribute(this.elementRef.nativeElement, 'aria-controls', this.popupId);
      this._renderer.setAttribute(this.elementRef.nativeElement, 'aria-expanded', 'false');
      this._renderer.setAttribute(this.popupComponent.location.nativeElement, 'id', this.popupId);

      if (this.minDate) {
        this.popupComponent.instance.minDate = this.parse.toDate(this.minDate);
      }

      if (this.maxDate) {
        this.popupComponent.instance.maxDate = this.parse.toDate(this.maxDate);
      }
    }

    if (this.clearable) {
      this.setupClearButton();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.popupComponent && changes.disabled?.previousValue !== changes.disabled?.currentValue) {
      if (`${this.disabled}` === 'true') {
        this.popupComponent.instance.ngOnDestroy();
      }

      if (`${this.disabled}` === 'false') {
        this.popupComponent.instance.ngOnInit();
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

  getInputRect(): DOMRect {
    return (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
  }

  setAriaExpanded(expanded: boolean): void {
    this._renderer.setAttribute(this.elementRef.nativeElement, 'aria-expanded', String(expanded));
  }

  setActiveDescendant(id: string | null): void {
    if (id) {
      this._renderer.setAttribute(this.elementRef.nativeElement, 'aria-activedescendant', id);
    } else {
      this._renderer.removeAttribute(this.elementRef.nativeElement, 'aria-activedescendant');
    }
  }

  private setupClearButton(): void {
    this.clearBtnEl = createClearButton(this._renderer, this.elementRef.nativeElement, this.modernTheme, () => this.clearValue());
    this.updateClearButtonVisibility();
  }

  private updateClearButtonVisibility(): void {
    updateClearButtonVisibility(this._renderer, this.clearBtnEl, this.elementRef.nativeElement as HTMLInputElement);
  }

  private clearValue(): void {
    this.writeValue(null);
    this.dtValue = { start: null, end: null };
    this.ngValue = null;
    this.onChange(this.ngValue);
    this.onTouched();

    if (this.popupComponent?.instance) {
      this.popupComponent.instance.isOpen = false;
    }

    this.elementRef.nativeElement.focus();
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: any): void {
    this._renderer.setProperty(this.elementRef.nativeElement, 'value', this.valueFormatter(value));

    if (this.popupComponent?.instance) {
      this.popupComponent.instance.rangeValue = this.readValue().dtValue;
    }

    this.updateClearButtonVisibility();
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);

    if (this.clearBtnEl) {
      this._renderer.setProperty(this.clearBtnEl, 'disabled', isDisabled);
      this._renderer.setStyle(this.clearBtnEl, 'display', isDisabled ? 'none' : '');
      if (!isDisabled) {
        this.updateClearButtonVisibility();
      }
    }
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

    const parsedDate = this.valueParser(value);
    this.dtValue = parsedDate.dtValue;
    this.ngValue = parsedDate.ngValue;

    if (!this.dtValue.start && !this.dtValue.end) {
      this.writeValue(null);
      this.onChange(this.ngValue);
      return;
    }

    this.onChange(this.ngValue);
    const val = this.resolveRangeModelConverter().toModel(this.dtValue, this.ngValue, NgDateConfigUtil.resolveHtmlValueConfig(this));
    this.writeValue(val);
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
    if (this._compositionMode) this.onChange(this.valueParser(value).ngValue);
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Converters only
  private resolveRangeModelConverter(): ApiNgDateRangeModelValueConverter<any> {
    const converterConfig = this.rangeModelConverterConfig;
    if (!converterConfig) return DefaultDateRangeModelValueConverter.INSTANCE;

    if (NgDateConfigUtil.isStringConstant(converterConfig)) {
      switch (converterConfig) {
        case 'date-range':
          return DefaultDateRangeModelValueConverter.INSTANCE;
        case 'string-iso-date-range':
          return DefaultFormattedRangeModelValueConverter.INSTANCE_ISO_YYYYMMDD;
        default:
          throw new Error(`Range converter ${converterConfig} is not implemented!`);
      }
    }

    return converterConfig as ApiNgDateRangeModelValueConverter<any>;
  }

  private convertNgValueToDtValue(newNgValue: any, dtValue: DateRange): DateRange {
    if (!newNgValue) {
      return { start: null, end: null };
    }

    return this.resolveRangeModelConverter().fromModel(newNgValue, dtValue, NgDateConfigUtil.resolveHtmlValueConfig(this));
  }

  private convertDtValueToHtmlValue(dtValue: DateRange): string {
    if (!dtValue || (!dtValue.start && !dtValue.end)) {
      return '';
    }

    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(this);
    const startText = dtValue.start ? formatDate(dtValue.start, htmlValueConfig.displayFormat, htmlValueConfig.locale, htmlValueConfig.timezone) : '';
    const endText = dtValue.end ? formatDate(dtValue.end, htmlValueConfig.displayFormat, htmlValueConfig.locale, htmlValueConfig.timezone) : '';

    return `${startText}${this.rangeSeparator}${endText}`;
  }

  private convertHtmlValueToDtValue(htmlValue: string, dtValue: DateRange): DateRange {
    const htmlValueConfig = NgDateConfigUtil.resolveHtmlValueConfig(this);
    const [startText = '', endText = ''] = this.splitRangeText(htmlValue);

    return {
      start: startText ? this.parse.parseDate(startText, htmlValueConfig.displayFormat, htmlValueConfig.locale, dtValue?.start) : null,
      end: endText ? this.parse.parseDate(endText, htmlValueConfig.displayFormat, htmlValueConfig.locale, dtValue?.end) : null,
    };
  }

  // `changeValue()` trims the formatted html value before parsing it back (matching the
  // single-date directive), which can eat the trailing half of `rangeSeparator` when only the
  // start date has been picked so far (e.g. "01.01.2026 - " -> "01.01.2026 -"). Try the exact
  // separator first (safest when a displayFormat itself contains e.g. '-'), and only fall back to
  // the trimmed separator if that didn't split anything.
  private splitRangeText(htmlValue: string): [string, string] {
    let parts = htmlValue.split(this.rangeSeparator);
    if (parts.length < 2) {
      parts = htmlValue.split(this.rangeSeparator.trim());
    }
    return [(parts[0] || '').trim(), (parts[1] || '').trim()];
  }

  private convertDtValueToNgModel(dtValue: DateRange, ngValue: any): any {
    return this.resolveRangeModelConverter().toModel(dtValue, ngValue, NgDateConfigUtil.resolveHtmlValueConfig(this));
  }

  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private valueFormatter(ngValue: any): string {
    this.ngValue = ngValue;
    this.dtValue = this.convertNgValueToDtValue(this.ngValue, this.dtValue);
    return this.convertDtValueToHtmlValue(this.dtValue);
  }

  private valueParser(htmlValue: string): { dtValue: DateRange; ngValue: any } {
    if (!htmlValue.trim()) {
      return { dtValue: { start: null, end: null }, ngValue: null };
    }

    const dtValue = this.convertHtmlValueToDtValue(htmlValue, this.dtValue);
    const ngValue = this.convertDtValueToNgModel(dtValue, this.ngValue);
    return { ngValue, dtValue };
  }

  public readValue(): NgDateRangeValue {
    return {
      dtValue: this.dtValue,
      ngValue: this.ngValue,
    };
  }

  public getLocale(): string {
    return NgDateConfigUtil.resolveHtmlValueConfig(this).locale;
  }

  public changeValue(value: DateRange) {
    const newHtmlValue = (this.convertDtValueToHtmlValue(value) || '').trim();
    const oldHtmlValue = (this.elementRef.nativeElement.value || '').trim();
    if (newHtmlValue === oldHtmlValue) return;

    const parsed = this.valueParser(newHtmlValue);
    this.dtValue = parsed.dtValue;
    this.ngValue = parsed.ngValue;

    this.onChange(this.ngValue);
    this.writeValue(this.ngValue);
    this.onTouched();
  }
}
