import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products.service';
import { formatPrice } from '../../../constants/currency.constant';

@Component({
  selector: 'app-cart-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-listing.component.html',
  styleUrl: './cart-listing.component.css'
})
export class CartListingComponent {

    format = formatPrice;   


  constructor(private productService: ProductService) { }

  @Input() cartItems: any[] = [];
  @Input() loadingItemId: number | null = null;
  @Input() imageUrlFn!: (filename: string) => string;

  @Output() remove = new EventEmitter<number>();
  @Output() increase = new EventEmitter<any>();
  @Output() decrease = new EventEmitter<any>();

  getImageUrl(filename: string): string {
    if (this.imageUrlFn) {
      return this.imageUrlFn(filename);
    }
    return this.productService.getImageUrl(filename);
  }

  removeItem(id: number) {
    this.remove.emit(id);
  }

  increaseQty(item: any) {
    this.increase.emit(item);
  }

  decreaseQty(item: any) {
    this.decrease.emit(item);
  }
}
