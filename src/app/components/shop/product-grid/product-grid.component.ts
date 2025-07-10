import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products.service';
import { formatPrice } from '../../../constants/currency.constant';
import { WishlistService } from '../../../services/wishlist.service'; // ✅ new
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink  } from '@angular/router';


@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {
  format = formatPrice;
  wishlistIds: number[] = [];

  constructor(
    private productService: ProductService,
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {}

  @Input() products: any[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() perPage = 10;
  @Input() page = 1;
  @Input() imageUrlFn!: (filename: string) => string;
  @Output() pageChange = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();
  @Output() QuickView = new EventEmitter<any>();

  Math = Math;

  ngOnInit() {
    if (this.authService.hasToken()) {
      this.loadWishlist();
    }
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlistIds = res.data.map((item: any) => item.product.id);
      },
      error: () => {
        console.warn('❌ Wishlist fetch failed');
      }
    });
  }

  isNewProduct(createdAt: string): boolean {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();
    return diffInMs / (1000 * 60 * 60 * 24) <= 7;
  }

  getImageUrl(filename: string): string {
    return this.imageUrlFn ? this.imageUrlFn(filename) : this.productService.getImageUrl(filename);
  }

  emitPageChange(p: number) {
    this.pageChange.emit(p);
  }

  emitAddToCart(product: any) {
    this.addToCart.emit(product);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistIds.includes(productId);
  }

  toggleWishlist(product: any): void {
    if (!this.authService.hasToken()) {
      this.toastr.warning('Please login to add to wishlist');
      this.router.navigate(['/signin']);
      return;
    }

    const id = product.id;

    if (this.isInWishlist(id)) {
      this.wishlistService.removeFromWishlist(id).subscribe({
        next: () => {
          this.wishlistIds = this.wishlistIds.filter(pid => pid !== id);
          this.toastr.warning('Removed from wishlist');
        },
        error: () => this.toastr.error('Error removing from wishlist'),
      });
    } else {
      this.wishlistService.addToWishlist(id).subscribe({
        next: () => {
          this.wishlistIds.push(id);
          this.toastr.success('Added to wishlist');
        },
        error: () => this.toastr.error('Error adding to wishlist'),
      });
    }
  }
  onProductClick() {
  sessionStorage.setItem('shopScrollY', String(window.scrollY));
}
}
