import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionpaymentComponent } from './subscriptionpayment.component';

describe('SubscriptionpaymentComponent', () => {
  let component: SubscriptionpaymentComponent;
  let fixture: ComponentFixture<SubscriptionpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionpaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
