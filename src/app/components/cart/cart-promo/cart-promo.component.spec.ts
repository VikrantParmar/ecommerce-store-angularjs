import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPromoComponent } from './cart-promo.component';

describe('CartPromoComponent', () => {
  let component: CartPromoComponent;
  let fixture: ComponentFixture<CartPromoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPromoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
