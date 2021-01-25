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

  private inputElement: HTMLInputElement;
  private wrapperElement: Node & ParentNode;

  public isOpen = false;
  public val: { internal: Date; ngModel: string };

  ngOnInit(): void {
    this.inputElement = this.ngDateDirective.elementRef.nativeElement;
    this.wrapperElement = this.inputElement?.parentNode;

    this.inputElement.addEventListener('pointerup', this.onInputTouch);
  }

  ngOnDestroy() {
    this.inputElement.removeEventListener('pointerup', this.onInputTouch);
  }

  private onInputTouch = () => {
    console.log(this.ngDateDirective.readValue());
    document.removeEventListener('pointerdown', this.onFocusOut);

    this.isOpen = true;
    this.val = this.ngDateDirective.readValue();

    setTimeout(() => {
      document.addEventListener('pointerdown', this.onFocusOut);
    });
  };

  // tento zapis je kvoli zachovaniu kontextu
  private onFocusOut = (e: Event) => {
    const inPopup = e.composedPath().some((element) => (element as HTMLElement).classList?.contains('ng-date-popup'));
    if (inPopup) return;

    document.removeEventListener('pointerdown', this.onFocusOut);
    this.isOpen = false;
    this.ngDateDirective.onTouched();
  };
}
