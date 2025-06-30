import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/products.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductUtilsService {

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private productService: ProductService
  ) {}

  // ✅ Get product image URL
  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  // ✅ Add to cart with stock validation
  addToCart(product: any): void {
    if (product.stock === 0) {
      this.toastr.error('This product is out of stock!');
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => this.toastr.success('Product added to cart'),
      error: () => this.toastr.error('Failed to add product to cart'),
    });
  }


}
