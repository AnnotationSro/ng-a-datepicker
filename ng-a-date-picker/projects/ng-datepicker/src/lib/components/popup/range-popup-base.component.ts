import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { getWeekStartByLocale } from 'weekstart';
import { NgDateRangeDirectiveApi } from '../../directives/ng-date-range/ng-date-range.directive.api';
import { DateRange } from '../../model/ng-date-range-public.model';
import { WeekDay } from '../../ng-datepicker.module';
import { PositionedPopupBase } from './positioned-popup-base.component';
import { CalendarDay, calendarUtils } from './popup-base.component';

/**
 * Shared interaction logic for the range popup (dates only - no time-of-day), independent of
 * which visual theme (template) is used. Mirrors PopupBaseComponent's structure/positioning but
 * tracks a start/end pair instead of a single value.
 */
@Directive()
export abstract class RangePopupBaseComponent extends PositionedPopupBase<NgDateRangeDirectiveApi> implements OnInit, OnDestroy {
  @Input()
  public ngDateRangeDirective: NgDateRangeDirectiveApi = null;

  @Input()
  public locale: string = undefined;

  @Input() public keepOpen: boolean = false;
  @Input() public showActionButtons: boolean = false;

  @Input() public maxDate: Date;
  @Input() public minDate: Date;

  protected get directiveApi(): NgDateRangeDirectiveApi {
    return this.ngDateRangeDirective;
  }

  public isOpen = false;
  public days: CalendarDay[];
  public localizedDays: string[];

  public rangeStart: Date | null = null;
  public rangeEnd: Date | null = null;
  public hoverDate: Date | null = null;
  public focusedDate: Date;

  private pendingRange: DateRange | null = null;
  private firstDayOfWeek: WeekDay;
  private _viewDate: Date;
  private _today: Date;

  set rangeValue(range: DateRange) {
    this.rangeStart = range?.start ?? null;
    this.rangeEnd = range?.end ?? null;
  }

  get viewDate(): Date {
    if (!this._viewDate) {
      this._viewDate = new Date(this.rangeStart || this._today);
    }
    return this._viewDate;
  }

  constructor(_elementRef: ElementRef<HTMLElement>) {
    super(_elementRef);
    const myDate = new Date();
    const timePortion = (myDate.getTime() - myDate.getTimezoneOffset() * 60 * 1000) % (3600 * 1000 * 24);
    this._today = new Date(+myDate - timePortion);
  }

  ngOnInit(): void {
    this.localizeComponent();
    this.ngDateRangeDirective.addEventListenerToInput('pointerup', this.onInputTouch);
    this.ngDateRangeDirective.addEventListenerToInput('keydown', this.onInputKeydown);
    this.movePopupIfAppended();
  }

  ngOnDestroy(): void {
    this.ngDateRangeDirective.removeEventListenerFromInput('pointerup', this.onInputTouch);
    this.ngDateRangeDirective.removeEventListenerFromInput('keydown', this.onInputKeydown);
    super.ngOnDestroy();
  }

  /// ///////////////////////////////////
  // Component setup
  /// ///////////////////////////////////
  private localizeComponent(): void {
    if (!this.locale) {
      this.locale = this.ngDateRangeDirective.getLocale();
    }

    this.firstDayOfWeek = getWeekStartByLocale(this.locale);

    this.localizedDays = JSON.parse(JSON.stringify(this.daysForLocale(this.locale)));
    const tmp = this.localizedDays.splice(0, this.firstDayOfWeek);
    this.localizedDays = this.localizedDays.concat(tmp);
  }

  daysForLocale(localeName = 'en-US') {
    const format = new Intl.DateTimeFormat(localeName, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(`2023-01-${i + 1}`)));
  }

  private readDays(): void {
    this.days = calendarUtils.createCalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.firstDayOfWeek);
  }

  /// ///////////////////////////////////
  // Handle input[ngDateRange] interaction
  /// ///////////////////////////////////
  private onInputTouch = () => {
    document.removeEventListener('pointerdown', this.onFocusOut);

    const current = this.ngDateRangeDirective.readValue().dtValue;
    this.rangeStart = current?.start ?? null;
    this.rangeEnd = current?.end ?? null;
    this.hoverDate = null;
    this._viewDate = new Date(this.rangeStart || this._today);
    this.focusedDate = this.rangeStart || this._today;

    this.readDays();
    this.isOpen = true;
    this.ngDateRangeDirective.setAriaExpanded(true);
    this.updateActiveDescendant();

    this.position = (<unknown>'bottom-hidden') as any; // reset position, avoid a flash before measuring
    setTimeout(() => {
      this.recomputePosition();
    });
    this.addPositionListeners();

    document.addEventListener('pointerdown', this.onFocusOut);
  };

  private closePopupInternal(): void {
    this.isOpen = false;
    this.ngDateRangeDirective.setAriaExpanded(false);
    this.ngDateRangeDirective.setActiveDescendant(null);
    this.removePositionListeners();
  }

  private updateActiveDescendant(): void {
    if (!this.focusedDate || !this.popupId) {
      this.ngDateRangeDirective.setActiveDescendant(null);
      return;
    }

    this.ngDateRangeDirective.setActiveDescendant(`${this.popupId}-day-${calendarUtils.dayCellId(this.focusedDate)}`);
  }

  private onFocusOut = (e: Event) => {
    const inPopup = e.composedPath().some((element) => (element as HTMLElement).classList?.contains('ng-date-popup'));
    if (inPopup) {
      return;
    }

    document.removeEventListener('pointerdown', this.onFocusOut);

    if (this.showActionButtons && this.pendingRange) {
      this.closePopup();
    } else {
      this.closePopupInternal();
    }

    this.ngDateRangeDirective.onTouched();
  };

  private commitOrStage(): void {
    const range: DateRange = { start: this.rangeStart, end: this.rangeEnd };

    if (this.showActionButtons) {
      this.pendingRange = range;
    } else {
      this.ngDateRangeDirective.changeValue(range);
      const committed = this.ngDateRangeDirective.readValue().dtValue;
      this.rangeStart = committed?.start ?? null;
      this.rangeEnd = committed?.end ?? null;
    }
  }

  apply(): void {
    if (this.pendingRange) {
      this.ngDateRangeDirective.changeValue(this.pendingRange);
      const committed = this.ngDateRangeDirective.readValue().dtValue;
      this.rangeStart = committed?.start ?? null;
      this.rangeEnd = committed?.end ?? null;
      this.pendingRange = null;
    }
    this.closePopupInternal();
  }

  closePopup(): void {
    this.pendingRange = null;
    const current = this.ngDateRangeDirective.readValue().dtValue;
    this.rangeStart = current?.start ?? null;
    this.rangeEnd = current?.end ?? null;
    this.closePopupInternal();
  }

  /// ///////////////////////////////////
  // Handle user interaction with popup
  /// ///////////////////////////////////
  setDate(date: Date): void {
    if (this.isOutOfBounds(date)) return;

    if (!this.rangeStart || this.rangeEnd) {
      // starting a fresh selection
      this.rangeStart = date;
      this.rangeEnd = null;
    } else if (date < this.rangeStart) {
      this.rangeEnd = this.rangeStart;
      this.rangeStart = date;
    } else {
      this.rangeEnd = date;
    }

    this.hoverDate = null;
    this.commitOrStage();

    if (this.rangeEnd && !this.keepOpen && !this.showActionButtons) {
      this.closePopupInternal();
    }

    this.readDays();
  }

  onDayHover(date: Date): void {
    if (this.rangeStart && !this.rangeEnd) {
      this.hoverDate = date;
    }
  }

  addMonth(): void {
    this._viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.readDays();
  }

  removeMonth(): void {
    this._viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.readDays();
  }

  isRangeStart(date: Date): boolean {
    return !!this.rangeStart && this.rangeStart.toLocaleDateString() === date.toLocaleDateString();
  }

  isRangeEnd(date: Date): boolean {
    return !!this.rangeEnd && this.rangeEnd.toLocaleDateString() === date.toLocaleDateString();
  }

  isInRange(date: Date): boolean {
    const range = this.getEffectiveRange();
    if (!range) return false;

    const strippedDate = this.stripTime(date);
    return strippedDate >= range.lo && strippedDate <= range.hi;
  }

  // Whether `date` is the low/high end of the *currently highlighted* range - which, while the
  // user is still previewing (rangeStart set, rangeEnd not yet picked), is the hovered/keyboard-
  // focused date rather than rangeEnd. Used to round only the true end-caps of the highlighted
  // band (`:first-child`/`:last-child` can't do this - those only ever match the first/last cell
  // of the whole 42-cell grid, not the first/last cell of a highlighted subset within it).
  isRangeEdgeStart(date: Date): boolean {
    const range = this.getEffectiveRange();
    return !!range && this.stripTime(date).getTime() === range.lo.getTime();
  }

  isRangeEdgeEnd(date: Date): boolean {
    const range = this.getEffectiveRange();
    return !!range && this.stripTime(date).getTime() === range.hi.getTime();
  }

  private getEffectiveRange(): { lo: Date; hi: Date } | null {
    if (!this.rangeStart) return null;

    const effectiveEnd = this.rangeEnd || this.hoverDate;
    if (!effectiveEnd) return null;

    const [lo, hi] = this.rangeStart <= effectiveEnd ? [this.rangeStart, effectiveEnd] : [effectiveEnd, this.rangeStart];
    return { lo: this.stripTime(lo), hi: this.stripTime(hi) };
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  isFocused(date: Date): boolean {
    return !!this.focusedDate && this.focusedDate.toLocaleDateString() === date.toLocaleDateString();
  }

  private onInputKeydown = (e: KeyboardEvent) => {
    if (!this.isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.onInputTouch();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        if (this.showActionButtons && this.pendingRange) {
          this.closePopup();
        } else {
          this.closePopupInternal();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.moveFocusedDate(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveFocusedDate(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveFocusedDate(-7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveFocusedDate(7);
        break;
      case 'PageUp':
        if (!this.wouldBeOutOfBounds(false)) {
          e.preventDefault();
          this.removeMonth();
          this.clampFocusedDateIntoView();
        }
        break;
      case 'PageDown':
        if (!this.wouldBeOutOfBounds(true)) {
          e.preventDefault();
          this.addMonth();
          this.clampFocusedDateIntoView();
        }
        break;
      case 'Enter':
      case ' ':
        if (!this.isOutOfBounds(this.focusedDate)) {
          e.preventDefault();
          this.setDate(new Date(this.focusedDate));
        }
        break;
    }
  };

  private moveFocusedDate(deltaDays: number): void {
    const candidate = new Date(this.focusedDate);
    candidate.setDate(candidate.getDate() + deltaDays);

    if (this.isOutOfBounds(candidate)) return;

    this.focusedDate = candidate;
    this.onDayHover(candidate); // keyboard cursor previews the range the same way mouse hover does

    if (candidate.getMonth() !== this.viewDate.getMonth() || candidate.getFullYear() !== this.viewDate.getFullYear()) {
      this._viewDate = new Date(candidate.getFullYear(), candidate.getMonth(), 1);
      this.readDays();
    }

    this.updateActiveDescendant();
  }

  private clampFocusedDateIntoView(): void {
    const lastDayOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).getDate();
    const day = Math.min(this.focusedDate.getDate(), lastDayOfMonth);

    this.focusedDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
    this.updateActiveDescendant();
  }

  isOutOfBounds(date: Date): boolean {
    return this.isLowerThanMinDate(date) || this.isHigherThanMaxDate(date);
  }

  isHigherThanMaxDate(date: Date): boolean {
    return !!this.maxDate && +date > +this.maxDate;
  }

  isLowerThanMinDate(date: Date): boolean {
    return !!this.minDate && +date < +this.minDate;
  }

  wouldBeOutOfBounds(isAdd: boolean): boolean {
    const tmp = new Date(this.viewDate);

    if (!isAdd) {
      tmp.setDate(0);
    } else {
      tmp.setDate(1);
      tmp.setMonth(tmp.getMonth() + 1);
    }

    return this.isOutOfBounds(tmp);
  }
}
