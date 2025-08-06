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
  ) { }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  addToCart(product: any): void {
    const variant = product.selectedVariant || product.variants?.[0];
    const stock = variant?.stock ?? product.stock;
    const quantity = product.quantity || 1;

    // ✅ Block if stock is already 0
    if (!product || stock === 0) {
      this.toastr.error('This product is out of stock!');
      return;
    }

    // ✅ Block if requested quantity exceeds available stock
    if (quantity > stock) {
      this.toastr.error(`Only ${stock} item(s) available`);
      return;
    }

    const payload = {
      productId: product.id,
      variantId: variant?.id || null,
      quantity,
    };

    this.cartService.addToCart(payload).subscribe({
      next: () => {
        this.toastr.success('Product added to cart');
        if (variant) {
          variant.stock -= quantity;
          if (variant.stock === 0) {
            this.toastr.warning('This variant is now out of stock!');
          }
        } else {
          product.stock -= quantity;
          if (product.stock === 0) {
            this.toastr.warning('This product is now out of stock!');
          }
        }
      },
      error: (error) => {
        const errorMsg = error?.error?.message || 'Failed to add product to cart';
        this.toastr.error(errorMsg);
      },
    });

  }




}
