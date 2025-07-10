import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/products.service';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule,RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  loading = true;

  constructor(
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  getImageUrl(filename: string): string {
  return this.productService.getImageUrl(filename);
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

  removeItem(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter(p => p.product.id !== productId);
        this.toastr.warning('Removed from wishlist');
      },
      error: () => {
        this.toastr.error('Error removing from wishlist');
      },
    });
  }

  moveToCart(item: any) {
  this.cartService.addToCart(item.product.id).subscribe({
    next: () => {
      // this.removeItem(item.product.id);
      this.toastr.success('Added to cart');
    },
    error: () => {
      this.toastr.error('Failed to add to cart');
    }
  });
}
}
