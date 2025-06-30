import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormValidationHelperComponent } from './form-validation.helper.component';

describe('FormValidationHelperComponent', () => {
  let component: FormValidationHelperComponent;
  let fixture: ComponentFixture<FormValidationHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormValidationHelperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormValidationHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
