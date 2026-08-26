import { Component, ViewEncapsulation } from '@angular/core';
import { RangePopupBaseComponent } from './range-popup-base.component';

@Component({
  selector: 'ng-date-range-popup',
  templateUrl: './range-popup.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class RangePopupComponent extends RangePopupBaseComponent {}
