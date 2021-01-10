/* eslint-disable */
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'a-date',
  templateUrl: './ng-datepicker.component.html',
  styleUrls: ['./ng-datepicker.component.scss'],
})
export class NgDatepickerComponent implements OnInit {
  constructor() {}

  @Input()
  value: string | number | Date = new Date();

  @Input()
  format: string = null;

  // Date pipe na convert na objektu
  ngOnInit(): void {}


  /*
  * value = string | number | Date
  * showFormat
  * valueType = 'string'|'number'|'Date'
  *
  * => input value="MM/YYYY"
  *
  *  1) VALUE (input) => conv TEXT (html)
  *  2) TEXT (html) => VALUE (output)
  *
  *
  *
  *
  * <input type="" date="MM/YYYY" ngModel=""  />
  *
  * ng1)
  * */

}
