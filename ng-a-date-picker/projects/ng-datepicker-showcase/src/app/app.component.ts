import { Component } from '@angular/core';
import {NgDateConfig} from "../../../ng-datepicker/src/lib/model/ng-date-public.model"; //todo(psl2mfi): for discussion
// import { NgDateConfig } from 'ng-datepicker';

@Component({
  selector: 'a-date-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-datepicker-showcase';

  currentDateTime = new Date();
  ngDateConf: NgDateConfig = {
    displayFormat: 'dd.MM.yyyy o HH:mm',
    modelConverter: 'string-iso-datetime',
    // firstValueConverter: 'date',
  };

  currentDateTime2 = new Date();
  ngDateConf2: NgDateConfig = {
    displayFormat: 'HH:mm',
    modelConverter: 'string-iso-time',
    // firstValueConverter: 'date',
  };

  currentDateTime3 = new Date();

  log($event: Event) {
    // console.log('change');
    // console.log($event);
  }

  logM($event: any) {
    // console.log('ngModel');
    // console.log($event);
  }
}
