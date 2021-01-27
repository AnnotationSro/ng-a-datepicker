import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
// import {NgDatepickerModule} from "ng-datepicker";
import { NgDatepickerModule } from '../../../ng-datepicker/src/lib/ng-datepicker.module'; //todo(psl2mfi): for discussion

@NgModule({
  declarations: [AppComponent],
  // imports: [BrowserModule, NgDatepickerModule, FormsModule],
  imports: [
    BrowserModule,
    // NgDatepickerModule.forRoot({})
    // NgDatepickerModule.forRoot({
    //   all: { firstValueConverter: 'date', displayFormat: 'medium', modelConverter: 'string-iso-datetime-with-zone' },
    // }),
    FormsModule,
    NgDatepickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
