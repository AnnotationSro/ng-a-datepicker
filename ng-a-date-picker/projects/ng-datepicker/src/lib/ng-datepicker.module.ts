import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatepickerComponent } from './ng-datepicker/ng-datepicker.component';
import { AnnotationDateDirective } from './directives/date/annotation-date.directive';
import { NgDatepickerConf } from './conf/ng-datepicker.conf';
import { NG_DATEPICKER_CONF } from './conf/ng-datepicker.conf.token';

@NgModule({
  declarations: [NgDatepickerComponent, AnnotationDateDirective],
  imports: [CommonModule],
  exports: [NgDatepickerComponent, AnnotationDateDirective],
})
export class NgDatepickerModule {
  static forRoot(ngDatepickerConf: NgDatepickerConf): ModuleWithProviders<NgDatepickerModule> {
    return {
      ngModule: NgDatepickerModule,
      providers: [{ provide: NG_DATEPICKER_CONF, useValue: ngDatepickerConf }],
    };
  }
}
