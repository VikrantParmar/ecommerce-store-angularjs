import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartListingComponent } from './cart-listing.component';

describe('CartListingComponent', () => {
  let component: CartListingComponent;
  let fixture: ComponentFixture<CartListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
