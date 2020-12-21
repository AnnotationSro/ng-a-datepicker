import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDatepickerComponent } from './ng-datepicker.component';

describe('NgDatepickerComponent', () => {
  let component: NgDatepickerComponent;
  let fixture: ComponentFixture<NgDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDatepickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
