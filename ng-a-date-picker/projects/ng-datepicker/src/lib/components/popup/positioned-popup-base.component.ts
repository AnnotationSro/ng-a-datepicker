import { Directive, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

/**
 * The subset of directive-side behavior any popup (single-date or range) needs regardless of its
 * value shape - pure input-DOM manipulation and ARIA state, nothing about what's actually selected.
 * `NgDateDirectiveApi` (and the range equivalent) already satisfy this structurally.
 */
export interface PopupHostApi {
  addEventListenerToInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListenerFromInput<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;

  getInputHeight(): number;

  getInputRect(): DOMRect;

  setAriaExpanded(expanded: boolean): void;

  setAriaActiveDescendant(id: string | null): void;

  onTouched: () => void;
}

export const positionUtils = {
  // src (flip-up-when-there's-no-room idea): https://github.com/ng-select/ng-select/commit/d4404f7
  getPosition: (
    inputRect: DOMRect,
    popupHeight: number
  ): { top: number; left: number; position: 'top' | 'bottom' } => {
    const SPACE_BETWEEN_ELEMENTS = 5; // px
    const spaceBelow = document.documentElement.clientHeight - inputRect.bottom;
    const shouldFlipUp = spaceBelow < popupHeight && inputRect.top > popupHeight;

    return {
      left: inputRect.left,
      top: shouldFlipUp ? inputRect.top - popupHeight - SPACE_BETWEEN_ELEMENTS : inputRect.bottom + SPACE_BETWEEN_ELEMENTS,
      position: shouldFlipUp ? 'top' : 'bottom',
    };
  },
};

/**
 * Shared positioning/appendTo machinery for any popup component, independent of what value shape
 * (single date vs range) it's selecting. Position is always computed from the input's real
 * `getBoundingClientRect()` (rather than relying on CSS layout of a DOM sibling), so it works
 * regardless of the input's surrounding layout (block, flex, grid, inline, ...).
 */
@Directive()
export abstract class PositionedPopupBase<TApi extends PopupHostApi> implements OnDestroy {
  @Input() appendTo: string;
  @Input() popupId: string;

  @ViewChild('popupRoot') popupRootRef: ElementRef<HTMLElement>;

  public position: 'top' | 'bottom' = 'bottom';
  public popupLeft: number;
  public popupTop: number;

  protected abstract get directiveApi(): TApi;

  constructor(protected _elementRef: ElementRef<HTMLElement>) {}

  protected movePopupIfAppended(): void {
    if (this.appendTo) {
      const targetEl = document.querySelector(this.appendTo);
      if (targetEl) {
        targetEl.appendChild(this._elementRef.nativeElement);
      }
    }
  }

  protected recomputePosition = () => {
    const inputRect = this.directiveApi.getInputRect();
    const popupEl = this.popupRootRef?.nativeElement;
    if (!popupEl) return;

    const { top, left, position } = positionUtils.getPosition(inputRect, popupEl.offsetHeight);
    this.popupTop = top;
    this.popupLeft = left;
    this.position = position;
  };

  protected addPositionListeners(): void {
    window.addEventListener('scroll', this.recomputePosition, { capture: true, passive: true });
    window.addEventListener('resize', this.recomputePosition, { passive: true });
  }

  protected removePositionListeners(): void {
    window.removeEventListener('scroll', this.recomputePosition, { capture: true } as any);
    window.removeEventListener('resize', this.recomputePosition as any);
  }

  ngOnDestroy(): void {
    this.removePositionListeners();
  }
}
