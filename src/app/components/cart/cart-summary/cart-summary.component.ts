import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatPrice } from '../../../constants/currency.constant';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.css']
})
export class CartSummaryComponent {

  format = formatPrice;


  @Input() totalQuantity = 0;
  @Input() subtotal = 0;
  @Input() discount = 0;
  @Input() grandTotal = 0;
  @Input() cartItems: any[] = [];


  @Output() checkout = new EventEmitter<void>();


  hasOutOfStock(): boolean {
  return this.cartItems?.some(item => item.Product.stock === 0);
}



}

