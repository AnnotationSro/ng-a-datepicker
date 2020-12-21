import { TestBed } from '@angular/core/testing';

import { NgADatePickerService } from './ng-a-date-picker.service';

describe('NgADatePickerService', () => {
  let service: NgADatePickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgADatePickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
