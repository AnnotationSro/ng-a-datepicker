import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatepickerConf } from './conf/ng-datepicker.conf';
import { NG_DATEPICKER_CONF } from './conf/ng-datepicker.conf.token';
import { NgDateDirective } from './directives/ng-date.directive';
import { MinDateDirective } from './directives/validators/min-date.directive';
import { MaxDateDirective } from './directives/validators/max-date.directive';

@NgModule({
  declarations: [NgDateDirective, MinDateDirective, MaxDateDirective],
  imports: [CommonModule],
  exports: [NgDateDirective, MinDateDirective, MaxDateDirective],
})
export class NgDatepickerModule {
  static forRoot(ngDatepickerConf: NgDatepickerConf): ModuleWithProviders<NgDatepickerModule> {
    return {
      ngModule: NgDatepickerModule,
      providers: [{ provide: NG_DATEPICKER_CONF, useValue: ngDatepickerConf }],
    };
  }
}
