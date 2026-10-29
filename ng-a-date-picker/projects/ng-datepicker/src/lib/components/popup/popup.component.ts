import { Component, ViewEncapsulation } from '@angular/core';
import { PopupBaseComponent } from './popup-base.component';

@Component({
  selector: 'ng-date-popup',
  templateUrl: './popup.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent extends PopupBaseComponent {}
