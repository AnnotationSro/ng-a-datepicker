import { Renderer2 } from '@angular/core';

/**
 * Wraps `inputEl` in a positioning span and injects a "clear" button into it - shared by
 * `NgDateDirective` and `NgDateRangeDirective` since it's pure DOM manipulation with no
 * dependency on whether the bound value is a single date or a range.
 */
export function createClearButton(
  renderer: Renderer2,
  inputEl: HTMLElement,
  modernTheme: boolean,
  onClear: () => void
): HTMLElement {
  const parent = renderer.parentNode(inputEl);
  const wrapper = renderer.createElement('span');
  renderer.addClass(wrapper, 'ng-date-clear-wrapper');
  renderer.insertBefore(parent, wrapper, inputEl);
  renderer.appendChild(wrapper, inputEl);
  renderer.addClass(inputEl, 'ng-date-clear-input');

  const clearBtn = renderer.createElement('button');
  renderer.setAttribute(clearBtn, 'type', 'button');
  renderer.setAttribute(clearBtn, 'aria-label', 'Clear');

  if (modernTheme) {
    renderer.addClass(clearBtn, 'btn-close');
    renderer.addClass(clearBtn, 'ng-date-clear-btn--modern');
  } else {
    renderer.addClass(clearBtn, 'ng-date-clear-btn');
    renderer.setProperty(clearBtn, 'textContent', '×');
  }

  renderer.listen(clearBtn, 'click', (e: Event) => {
    e.stopPropagation();
    onClear();
  });
  renderer.appendChild(wrapper, clearBtn);

  return clearBtn;
}

export function updateClearButtonVisibility(renderer: Renderer2, clearBtnEl: HTMLElement | null, inputEl: HTMLInputElement): void {
  if (!clearBtnEl) return;

  const hasValue = !!inputEl.value;
  renderer.setStyle(clearBtnEl, 'display', hasValue ? '' : 'none');
}
