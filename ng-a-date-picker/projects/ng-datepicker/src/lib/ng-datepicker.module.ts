import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatepickerComponent } from './ng-datepicker/ng-datepicker.component';
import { AnnotationDateDirective } from './directives/annotation-date.directive';

@NgModule({
  declarations: [NgDatepickerComponent, AnnotationDateDirective],
  imports: [CommonModule],
  exports: [NgDatepickerComponent, AnnotationDateDirective],
})
export class NgDatepickerModule {}
