import { ApiNgDateModelValueConverter } from '../model/ng-date-public.model';
import { ParseService } from '../services/parse.service';
import { ServiceLocator } from '../services/service-locator';

export class DefaultNumberModelValueConverter implements ApiNgDateModelValueConverter<number> {
  static readonly INSTANCE = new DefaultNumberModelValueConverter();

  private parse: ParseService;
  constructor() {
    const isReady = ServiceLocator.onReady.getValue();
    if (!isReady) {
      ServiceLocator.onReady.subscribe((value) => {
        if (value) {
          this.parse = ServiceLocator.injector.get(ParseService);
        }
      });
    } else {
      this.parse = ServiceLocator.injector.get(ParseService);
    }
  }

  fromModel(value: string | number | Date): Date {
    return this.parse.toDate(value);
  }

  toModel(value: Date): number {
    return +value;
  }
}
