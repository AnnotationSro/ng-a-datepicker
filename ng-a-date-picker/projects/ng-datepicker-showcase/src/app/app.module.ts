import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgDatepickerModule } from '../../../ng-datepicker/src/lib/ng-datepicker.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgDatepickerModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
