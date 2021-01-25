import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgDatepickerConf } from './conf/ng-datepicker.conf';
import { NG_DATEPICKER_CONF } from './conf/ng-datepicker.conf.token';
import { NgDateDirective } from './directives/ng-date.directive';
import { MinDateDirective } from './directives/validators/min-date.directive';
import { MaxDateDirective } from './directives/validators/max-date.directive';
import { PopupComponent } from './components/popup/popup.component';

@NgModule({
  declarations: [NgDateDirective, MinDateDirective, MaxDateDirective, PopupComponent],
  imports: [CommonModule, FormsModule],
  exports: [NgDateDirective, MinDateDirective, MaxDateDirective, PopupComponent],
})
export class NgDatepickerModule {
  static forRoot(ngDatepickerConf: NgDatepickerConf): ModuleWithProviders<NgDatepickerModule> {
    return {
      ngModule: NgDatepickerModule,
      providers: [{ provide: NG_DATEPICKER_CONF, useValue: ngDatepickerConf }],
    };
  }
}
