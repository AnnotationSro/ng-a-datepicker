import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormStyle, getLocaleDayNames, getLocaleFirstDayOfWeek, TranslationWidth, WeekDay } from '@angular/common';
import { NgDateDirectiveApi, NgDateValue } from '../../directives/ng-date/ng-date.directive.api';
import { NgDateConfigUtil } from '../../conf/ng-date.config.util';
import { BasicDateFormat, HtmlValueConfig } from '../../model/ng-date-public.model';
import { DateType, getDateFormatParser } from '../../parsers/parse-date';

@Component({
  selector: 'ng-date-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit, OnDestroy {
  DateType = DateType;

  @Input()
  public ngDateDirective: NgDateDirectiveApi = null;

  @Input()
  public locale: string = undefined;

  public isOpen = false;
  public days: CalendarDay[];
  public localizedDays: string[];

  private firstDayOfWeek: WeekDay;

  private _val: NgDateValue = {} as NgDateValue;

  get val() {
    return this._val;
  }

  set val(value: NgDateValue) {
    if (!value.dtValue) {
      value.dtValue = new Date();
    }

    this._val = value;
  }

  ngOnInit(): void {
    this.localizeComponent();
    this.ngDateDirective.addEventListenerToInput('pointerup', this.onInputTouch);
  }

  ngOnDestroy() {
    this.ngDateDirective.removeEventListenerFromInput('pointerup', this.onInputTouch);
  }

  /// ///////////////////////////////////
  // Component setup
  /// ///////////////////////////////////
  private localizeComponent() {
    const conf = NgDateConfigUtil.resolveHtmlValueConfig(this.ngDateDirective);

    // TODO - mfilo - 27.01.2021 - we should listen to locale change in case app has dynamic locale
    if (!this.locale) {
      // we can get locale 3 ways:
      //  1) user defined in input
      //  2) if provided to module, its injected into ngDateDirective and then read from it
      //  3) if ngDateDirective is undefined or locale does not exist we fallback to default locale 'en'
      this.locale = conf.locale;
    }

    // TODO - mfilo - 27.01.2021 - presunut na lepsie miesto (onInit) :)
    this.configureCalendarContent(conf);

    this.firstDayOfWeek = getLocaleFirstDayOfWeek(this.locale);

    this.localizedDays = JSON.parse(JSON.stringify(getLocaleDayNames(this.locale, FormStyle.Standalone, TranslationWidth.Short)));
    const tmp = this.localizedDays.splice(0, this.firstDayOfWeek);
    this.localizedDays = this.localizedDays.concat(tmp);
  }

  // TODO - mfilo - 27.01.2021 - WIP!!!
  config: {
    year: boolean;
    month: boolean;
    date: boolean;
    hours: 'off' | '12' | '24';
    minutes: boolean;
    // seconds: boolean;
    // ostatne podla CalendarContentType
  };

  private configureCalendarContent(conf: HtmlValueConfig) {
    const { types } = getDateFormatParser(this.locale, conf.displayFormat as BasicDateFormat);

    if (!this.config) {
      // TODO - mfilo - 27.01.2021 - typings!!!
      this.config = {} as any;
    }

    this.config.year = types.includes(DateType.FullYear);
    this.config.month = types.includes(DateType.Month);
    this.config.date = types.includes(DateType.Date);
    this.config.hours = types.includes(DateType.Hours_24) ? '24' : 'off';
    this.config.minutes = types.includes(DateType.Minutes);
  }

  private readDays() {
    this.val = this.ngDateDirective.readValue();
    this.days = utils.createCalendar(this.val.dtValue.getFullYear(), this.val.dtValue.getMonth(), this.firstDayOfWeek);
  }

  /// ///////////////////////////////////
  // Handle input[ngDate] interaction
  /// ///////////////////////////////////
  private onInputTouch = () => {
    document.removeEventListener('pointerdown', this.onFocusOut);

    this.readDays();
    this.isOpen = true;

    document.addEventListener('pointerdown', this.onFocusOut);
  };

  // tento zapis je kvoli zachovaniu kontextu
  private onFocusOut = (e: Event) => {
    const inPopup = e.composedPath().some((element) => (element as HTMLElement).classList?.contains('ng-date-popup'));
    if (inPopup) {
      return;
    }

    document.removeEventListener('pointerdown', this.onFocusOut);
    this.isOpen = false;
    this.ngDateDirective.onTouched();
  };

  /// ///////////////////////////////////
  // Handle user interaction with popup
  /// ///////////////////////////////////
  setYear($event: number) {
    this.val.dtValue.setFullYear($event);
    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  setDate($event: Date) {
    this.val.dtValue.setDate($event.getDate());
    this.val.dtValue.setMonth($event.getMonth());
    this.val.dtValue.setFullYear($event.getFullYear());

    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  addMonth() {
    this.val.dtValue.setMonth(this.val.dtValue.getMonth() + 1);
    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  removeMonth() {
    this.val.dtValue.setMonth(this.val.dtValue.getMonth() - 1);
    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  setHours($event: any) {
    this.val.dtValue.setHours($event);
    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  setMinutes($event: any) {
    this.val.dtValue.setMinutes($event % 60);
    this.ngDateDirective.changeValue(this.val.dtValue);
    this.readDays();
  }

  compareDate(date: Date) {
    return this.val.dtValue.toLocaleDateString() === date.toLocaleDateString();
  }
}

const utils = {
  // months are 0 based!!! (january = 0)
  createCalendar: (year: number, month: number, firstDayOfWeek: WeekDay) => {
    const days: CalendarDay[] = [];

    const currMonthDays = new Date(year, month + 1, 0).getDate();

    // if firstDayOfMonth is first day of week, show previous week (same for lastDayOfMonth
    const firstDayOfMonth = utils.getDayOfWeek(new Date(year, month, 1), firstDayOfWeek) || 7;
    const lastDayOfMonth = 6 - utils.getDayOfWeek(new Date(year, month, currMonthDays), firstDayOfWeek) || 7;

    const nexyYearNumber = month === 11 ? year - 1 : year;
    const nextMonthNumber = (month + 1 + 12) % 12;

    const prevYearNumber = month === 0 ? year - 1 : year;
    const prevMonthNumber = (month - 1 + 12) % 12;
    const prevMonthDays = new Date(year, prevMonthNumber + 1, 0).getDate();

    const prevMonthStart = prevMonthDays - firstDayOfMonth;
    for (let i = 1; i <= firstDayOfMonth; i++) {
      const day = prevMonthStart + i;
      const date = new Date(Date.UTC(prevYearNumber, prevMonthNumber, day));
      const dayOfWeek = utils.getDayOfWeek(date, firstDayOfWeek);
      days.push({ day, currentMonth: false, date, dayOfWeek });
    }

    for (let j = 1; j <= currMonthDays; j++) {
      const date = new Date(Date.UTC(year, month, j));
      const dayOfWeek = utils.getDayOfWeek(date, firstDayOfWeek);
      days.push({ day: j, currentMonth: true, date, dayOfWeek });
    }

    for (let k = 1; k <= lastDayOfMonth; k++) {
      const date = new Date(Date.UTC(nexyYearNumber, nextMonthNumber, k));
      const dayOfWeek = utils.getDayOfWeek(date, firstDayOfWeek);
      days.push({ day: k, currentMonth: false, date, dayOfWeek });
    }

    return days;
  },

  getDayOfWeek: (date: Date, firstDayOfWeek: WeekDay): number => {
    return (date.getDay() - firstDayOfWeek + 7) % 7;
  },
};

interface CalendarDay {
  day: number;
  dayOfWeek: number;
  date: Date;
  currentMonth: boolean;
}

type CalendarContentType =
  | 'year-picker' // yyyy -> 2012
  | 'month-picker' // MM, yyyy -> Dec, 2012
  | 'standalone-month-picker' // LLLL -> December
  | 'date-picker' // d.M.yyyy -> 1.12.2012
  | 'date-time-picker' // dd.MM.yyyy, H:mm -> 1.12.2012, 4:18
  | 'time-picker' // H:mm -> 4:18
  | 'day-picker'; // EEEE -> Tuesday
