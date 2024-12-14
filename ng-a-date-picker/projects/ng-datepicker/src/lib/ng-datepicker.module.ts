import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgDatepickerConf } from './conf/ng-datepicker.conf';
import { NG_DATEPICKER_CONF } from './conf/ng-datepicker.conf.token';
import { NgDateDirective } from './directives/ng-date/ng-date.directive';
import { MinDateDirective } from './directives/validators/min-date.directive';
import { MaxDateDirective } from './directives/validators/max-date.directive';
import { PopupComponent } from './components/popup/popup.component';
import { ServiceLocator } from './services/service-locator';

@NgModule({
  declarations: [NgDateDirective, MinDateDirective, MaxDateDirective, PopupComponent],
  imports: [CommonModule, FormsModule],
  exports: [NgDateDirective, MinDateDirective, MaxDateDirective, PopupComponent],
})
export class NgDatepickerModule {
  // https://stackoverflow.com/a/42462579/5011810
  constructor(private injector: Injector) {
    ServiceLocator.injector = this.injector;
    ServiceLocator.onReady.next(true);
  }

  static forRoot(ngDatepickerConf: NgDatepickerConf): ModuleWithProviders<NgDatepickerModule> {
    return {
      ngModule: NgDatepickerModule,
      providers: [{ provide: NG_DATEPICKER_CONF, useValue: ngDatepickerConf }],
    };
  }
}

export declare enum WeekDay {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}
