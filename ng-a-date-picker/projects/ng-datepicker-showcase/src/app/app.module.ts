import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';
import localeSkExtra from '@angular/common/locales/extra/sk';
import { NgDatepickerModule } from '../../../ng-datepicker/src/lib/ng-datepicker.module';
import { AppComponent } from './app.component';

// TODO - mfilo - 27.01.2021 - create utility (hint: mappedobject)
registerLocaleData(
  ((locale) => {
    locale[10][0] = 'dd.MM.yyyy';

    return locale;
  })(localeSk),
  localeSkExtra
);

@NgModule({
  declarations: [AppComponent],
  // imports: [BrowserModule, NgDatepickerModule, FormsModule],
  imports: [
    BrowserModule,
    // NgDatepickerModule.forRoot({
    //   short: {
    //     displayFormat: 'HH:mm',
    //     modelConverter: DefaultFormattedModelValueConverter.INSTANCE_ISO_HHMM,
    //   },
    // }),
    // NgDatepickerModule.forRoot({
    //   all: { firstValueConverter: 'date', displayFormat: 'medium', modelConverter: 'string-iso-datetime-with-zone' },
    // }),
    FormsModule,
    NgDatepickerModule,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'sk',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
