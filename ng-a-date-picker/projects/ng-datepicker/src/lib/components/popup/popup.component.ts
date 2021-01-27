import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgDateDirectiveApi, NgDateValue } from '../../directives/ng-date/ng-date.directive.api';

// TODO - mfilo - 25.01.2021
//  - start of week
//  - AM/PM

@Component({
  selector: 'ng-date-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input()
  public ngDateDirective: NgDateDirectiveApi = null;

  public isOpen = false;
  public days: CalendarDay[];

  private _val: NgDateValue = {} as NgDateValue;
  get val() {
    return this._val;
  }

  set val(value: NgDateValue) {
    if (!value.dtValue) {
      value.dtValue = new Date();
    }

    this.days = utils.createCalendar(value.dtValue.getFullYear(), value.dtValue.getMonth());

    this._val = value;
  }

  ngOnInit(): void {
    this.ngDateDirective.addEventListenerToInput('pointerup', this.onInputTouch);
  }

  ngOnDestroy() {
    this.ngDateDirective.removeEventListenerFromInput('pointerup', this.onInputTouch);
  }

  /// ///////////////////////////////////
  // Handle input[ngDate] interaction
  /// ///////////////////////////////////
  private onInputTouch = () => {
    document.removeEventListener('pointerdown', this.onFocusOut);

    this.isOpen = true;
    this.val = this.ngDateDirective.readValue();

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
  }

  setDate($event: Date) {
    this.ngDateDirective.changeValue($event);
  }

  addMonth() {
    this.val.dtValue.setMonth(this.val.dtValue.getMonth() + 1);
    this.ngDateDirective.changeValue(this.val.dtValue);
  }

  removeMonth() {
    this.val.dtValue.setMonth(this.val.dtValue.getMonth() - 1);
    this.ngDateDirective.changeValue(this.val.dtValue);
  }

  compareDate(date: Date) {
    return this.val.dtValue.toLocaleDateString() === date.toLocaleDateString();
  }
}

const TMP_WEEK_START: 'sun' | 'mon' = 'mon';

const utils = {
  // months are 0 based!!! (january = 0)
  createCalendar: (year: number, month: number) => {
    const days: CalendarDay[] = [];

    const currMonthDays = new Date(year, month + 1, 0).getDate();

    // if firstDayOfMonth is first day of week, show previous week (same for lastDayOfMonth
    const firstDayOfMonth = utils.getDayOfWeek(new Date(year, month, 1)) || 7;
    const lastDayOfMonth = 6 - utils.getDayOfWeek(new Date(year, month, currMonthDays)) || 7;

    const nexyYearNumber = month === 11 ? year - 1 : year;
    const nextMonthNumber = (month + 1 + 12) % 12;

    const prevYearNumber = month === 0 ? year - 1 : year;
    const prevMonthNumber = (month - 1 + 12) % 12;
    const prevMonthDays = new Date(year, prevMonthNumber + 1, 0).getDate();

    const prevMonthStart = prevMonthDays - firstDayOfMonth;
    for (let i = 1; i <= firstDayOfMonth; i++) {
      const day = prevMonthStart + i;
      const date = new Date(Date.UTC(prevYearNumber, prevMonthNumber, day));
      const dayOfWeek = utils.getDayOfWeek(date);
      days.push({ day, currentMonth: false, date, dayOfWeek });
    }

    for (let j = 1; j <= currMonthDays; j++) {
      const date = new Date(Date.UTC(year, month, j));
      const dayOfWeek = utils.getDayOfWeek(date);
      days.push({ day: j, currentMonth: true, date, dayOfWeek });
    }

    for (let k = 1; k <= lastDayOfMonth; k++) {
      const date = new Date(Date.UTC(nexyYearNumber, nextMonthNumber, k));
      const dayOfWeek = utils.getDayOfWeek(date);
      days.push({ day: k, currentMonth: false, date, dayOfWeek });
    }

    return days;
  },
  getDayOfWeek: (date: Date): number => {
    // TMP_WEEK_START === 'mon' => monday = 0, sunday = 6
    return (date.getDay() - (TMP_WEEK_START === 'mon' ? 1 : 0) + 7) % 7;
  },
};

interface CalendarDay {
  day: number;
  dayOfWeek: number;
  date: Date;
  currentMonth: boolean;
}
