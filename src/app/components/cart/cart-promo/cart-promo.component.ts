import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatPrice } from '../../../constants/currency.constant';

@Component({
  selector: 'app-cart-promo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-promo.component.html',
  styleUrls: ['./cart-promo.component.css']
})
export class CartPromoComponent {

  format = formatPrice

  @Input() promoCode = '';
  @Input() discount = 0;
  @Input() discountType = '';
  @Input() discountValue: number = 0;
  @Input() promoMessage = '';
  @Input() promoError = '';
  @Input() promoApplying = false;

  @Output() promoCodeChange = new EventEmitter<string>();
  @Output() apply = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  resetPromo() {
    this.promoCodeChange.emit(this.promoCode);
  }
}
