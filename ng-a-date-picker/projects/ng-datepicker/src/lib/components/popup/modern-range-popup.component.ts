import { Component, ViewEncapsulation } from '@angular/core';
import { RangePopupBaseComponent } from './range-popup-base.component';

@Component({
  selector: 'ng-date-range-popup-modern',
  templateUrl: './modern-range-popup.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ModernRangePopupComponent extends RangePopupBaseComponent {}
