import { Component } from '@angular/core';

@Component({
  selector: 'a-date-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-datepicker-showcase';

  value1: string = '2020-01-01';
  value2: string = 'v2';
  enabled1: boolean = true;
  enabled2: boolean = true;
}
