import { ApiNgDateModelValueConverter } from '../model/ng-date-public.model';
import { ParseService } from '../services/parse.service';
import { ServiceLocator } from '../services/service-locator';

export class DefaultIsoStringModelValueConverter implements ApiNgDateModelValueConverter<string> {
  static readonly INSTANCE = new DefaultIsoStringModelValueConverter();

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

  fromModel(value: string): Date {
    if (!value || !value?.trim()?.length) return null;
    return this.parse.toDate(value);
  }

  toModel(value: Date): string {
    if (!value) return null;
    // console.log(value.getTimezoneOffset());
    return value.toISOString();
  }
}
