import { HasNgDateConf } from '../../conf/has-ng-date-conf';

export interface NgDateValue {
  dtValue: Date;
  ngValue: any;
}

export interface NgDateDirectiveApi extends HasNgDateConf {
  readValue: () => NgDateValue;
  changeValue: (value: Date) => void;

  onTouched: () => void;

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
}
