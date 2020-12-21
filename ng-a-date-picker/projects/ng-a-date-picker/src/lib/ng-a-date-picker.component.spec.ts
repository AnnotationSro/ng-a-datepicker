import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgADatePickerComponent } from './ng-a-date-picker.component';

describe('NgADatePickerComponent', () => {
  let component: NgADatePickerComponent;
  let fixture: ComponentFixture<NgADatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgADatePickerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgADatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
