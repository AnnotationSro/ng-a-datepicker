import { Component, ViewEncapsulation } from '@angular/core';
import { PopupBaseComponent } from './popup-base.component';

@Component({
  selector: 'ng-date-popup-modern',
  templateUrl: './modern-popup.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ModernPopupComponent extends PopupBaseComponent {}
