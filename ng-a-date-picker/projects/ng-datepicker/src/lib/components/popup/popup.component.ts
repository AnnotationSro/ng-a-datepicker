import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgDateDirective } from '../../directives/ng-date.directive';

@Component({
  selector: 'ng-date-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input()
  ngDateDirective: NgDateDirective;

  @Input()
  selector: string;

  @Input()
  wrapper: string;

  private inputElement: HTMLInputElement;
  private wrapperElement: Node & ParentNode;

  public isOpen = false;

  ngOnInit(): void {
    this.inputElement = this.ngDateDirective.elementRef.nativeElement;
    this.wrapperElement = this.inputElement?.parentNode;

    this.inputElement.addEventListener('pointerup', this.onInputTouch);
  }

  ngOnDestroy() {
    if (!this.inputElement) return;

    this.inputElement.removeEventListener('pointerup', this.onInputTouch);
  }

  private onInputTouch = () => {
    console.log(this.ngDateDirective.readValue());
  };
}
