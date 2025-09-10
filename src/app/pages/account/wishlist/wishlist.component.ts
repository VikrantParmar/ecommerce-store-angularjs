import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products.service';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { formatPrice } from '../../../constants/currency.constant';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  loading = true;
  format = formatPrice;


  constructor(
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  getCartImageUrl(item: any): string {
    if (item.variant?.images?.length > 0) {
      return this.productService.getVariantImageUrl(item.variant.images[0].image_url);
    }

    return this.productService.getImageUrl(item.product?.img);
  }


  ngOnInit() {
    this.fetchWishlist();
  }



  fetchWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlist = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  removeItem(productId: number, variantId: number | null = null) {
    this.wishlistService.removeFromWishlist(productId, variantId ?? undefined)
      .subscribe({
        next: () => {
          this.wishlist = this.wishlist.filter(
            p => !(p.product.id === productId && (p.variant?.id ?? null) === variantId)
          );
          this.toastr.success('Removed from wishlist');
        },
        error: () => {
          this.toastr.error('Error removing from wishlist');
        },
      });
  }


 moveToCart(item: any) {
  const payload = {
    productId: item.product.id,
    quantity: 1,
    ...(item.variant?.id ? { variantId: item.variant.id } : {})
  };

  this.cartService.addToCart(payload).subscribe({
    next: () => {
      this.toastr.success('Added to cart');
      // Optionally remove from wishlist:
      // this.removeItem(payload.productId, payload.variantId ?? null);
    },
    error: (err) => {
      const msg = err?.error?.message;

      if (msg === 'This product is out of stock!') {
        this.toastr.warning('This product is out of stock!');
      } else if (msg?.includes('Only')) {
        this.toastr.info(msg); // E.g., "Only 2 items left in stock."
      } else {
        this.toastr.info('Already in cart');
      }
    }
  });
}


}
