import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatepickerComponent } from './ng-datepicker/ng-datepicker.component';
import { TestDirectiveDirective } from './directives/test-directive.directive';

@NgModule({
  declarations: [NgDatepickerComponent, TestDirectiveDirective],
  imports: [CommonModule],
  exports: [NgDatepickerComponent, TestDirectiveDirective],
})
export class NgDatepickerModule {}
