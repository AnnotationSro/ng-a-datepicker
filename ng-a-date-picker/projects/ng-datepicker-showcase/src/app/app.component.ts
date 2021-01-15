import { Component } from '@angular/core';
import { DirectiveDateConfig } from '../../../ng-datepicker/src/lib/directives/date/date-configurator';

@Component({
  selector: 'a-date-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-datepicker-showcase';

  currentDateTime = new Date();
  ngDateConf: DirectiveDateConfig = {
    displayFormat: 'dd.MM.YYYY o HH:mm',
    modelConverter: 'string-iso-datetime',
    firstValueConverter: 'date',
  };

  currentDateTime2 = new Date();
  ngDateConf2: DirectiveDateConfig = {
    displayFormat: 'HH:mm',
    modelConverter: 'string-iso-time',
    firstValueConverter: 'date',
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
