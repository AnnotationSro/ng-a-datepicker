import { Component } from '@angular/core';

@Component({
  selector: 'a-date-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-datepicker-showcase';

  currentDateTime = new Date();
}
