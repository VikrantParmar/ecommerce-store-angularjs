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

addToCart(product: any, onLoading?: (loading: boolean) => void): void {
  const variant = product.selectedVariant || product.variants?.[0];
  const stock = variant?.stock ?? product.stock;
  const quantity = product.quantity || 1;

  if (!product || stock === 0) {
    this.toastr.error('This product is out of stock!');
    return;
  }

  if (quantity > stock) {
    this.toastr.error(`Only ${stock} item(s) available`);
    return;
  }

  const payload = {
    productId: product.id,
    variantId: variant?.id || null,
    quantity,
  };

  // Loader ON
  onLoading?.(true);

  this.cartService.addToCart(payload).subscribe({
    next: () => {
      this.toastr.success('Product added to cart');
      if (variant) variant.stock -= quantity;
      else product.stock -= quantity;
      onLoading?.(false); // Loader OFF
    },
    error: (error) => {
      this.toastr.error(error?.error?.message || 'Failed to add product to cart');
      onLoading?.(false); // Loader OFF
    },
  });
}





}
