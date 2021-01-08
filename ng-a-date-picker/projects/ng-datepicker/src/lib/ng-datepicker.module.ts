import { NgModule } from '@angular/core';
import { NgDatepickerComponent } from './ng-datepicker/ng-datepicker.component';
import { TestDirectiveDirective } from './directives/test-directive.directive';

@NgModule({
  declarations: [NgDatepickerComponent, TestDirectiveDirective],
  imports: [],
  exports: [NgDatepickerComponent, TestDirectiveDirective],
})
export class NgDatepickerModule {}
