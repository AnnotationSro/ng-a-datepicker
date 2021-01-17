import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatepickerConf } from './conf/ng-datepicker.conf';
import { NG_DATEPICKER_CONF } from './conf/ng-datepicker.conf.token';
import { NgDateDirective } from './directives/ng-date.directive';

@NgModule({
  declarations: [NgDateDirective],
  imports: [CommonModule],
  exports: [NgDateDirective],
})
export class NgDatepickerModule {
  static forRoot(ngDatepickerConf: NgDatepickerConf): ModuleWithProviders<NgDatepickerModule> {
    return {
      ngModule: NgDatepickerModule,
      providers: [{ provide: NG_DATEPICKER_CONF, useValue: ngDatepickerConf }],
    };
  }
}
