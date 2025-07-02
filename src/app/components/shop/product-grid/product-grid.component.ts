import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products.service';
import { formatPrice } from '../../../constants/currency.constant';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {

  format = formatPrice;

  constructor(private productService: ProductService) {}

  @Input() products: any[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() perPage = 10;
  @Input() page = 1;
  @Input() imageUrlFn!: (filename: string) => string; // ✅ Add this line
  @Output() pageChange = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();
  @Output() QuickView = new EventEmitter<any>();

  Math = Math;

  emitPageChange(p: number) {
    this.pageChange.emit(p);
  }

  emitAddToCart(productId: number) {
    this.addToCart.emit(productId);
  }

  getImageUrl(filename: string): string {
    if (this.imageUrlFn) {
      return this.imageUrlFn(filename); // ✅ Prefer external function
    }
    return this.productService.getImageUrl(filename); // fallback
  }


  isNewProduct(createdAt: string): boolean {
    const createdDate = new Date (createdAt);
    const now = new Date();

    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays <= 7;
  }


 }
