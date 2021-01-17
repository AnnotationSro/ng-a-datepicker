import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgDatepickerModule } from '../../../ng-datepicker/src/lib/ng-datepicker.module';

@NgModule({
  declarations: [AppComponent],
  // imports: [BrowserModule, NgDatepickerModule, FormsModule],
  imports: [
    BrowserModule,
    // NgDatepickerModule.forRoot({})
    NgDatepickerModule.forRoot({
      ngDateConfig: { firstValueConverter: 'date', displayFormat: 'medium', modelConverter: 'string-iso-datetime-with-zone' },
    }),
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
