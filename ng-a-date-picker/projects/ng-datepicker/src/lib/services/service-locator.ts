import { Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class ServiceLocator {
  public static injector: Injector = null;
  public static onReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}
