import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products.service';
import { formatPrice } from '../../../constants/currency.constant';
import { WishlistService } from '../../../services/wishlist.service'; // ✅ new
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { RatingDisplayComponent } from '../../product-ratings/rating-display/rating-display.component';


@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingDisplayComponent],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {
  format = formatPrice;
  wishlistIds: { productId: number; variantId: number | null }[] = [];

  constructor(
    private productService: ProductService,
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) { }

  @Input() products: any[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() perPage = 12;
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
        this.wishlistIds = res.data.map((item: any) => ({
          productId: item.product.id,
          variantId: item.variant?.id ?? null
        }));
      },
      error: (err) => {
        // console.warn('❌ Wishlist fetch failed', err);
      }
    });
  }

  isInWishlist(productId: number, variantId: number | null = null): boolean {
    const found = this.wishlistIds.some(
      (item) => item.productId === productId && item.variantId === variantId
    );
    return found;
  }

  toggleWishlist(product: any): void {
    if (!this.authService.hasToken()) {
      this.toastr.warning('Please login to add to wishlist');
      this.router.navigate(['/signin']);
      return;
    }

    const productId = product.id;

    const variantId =
      product.selectedVariant?.id ??
      product.variants?.[0]?.id ??
      null;

    // console.log(`🌀 Toggle wishlist: productId=${productId}, variantId=${variantId}`);

    if (this.isInWishlist(productId, variantId)) {
      this.wishlistService.removeFromWishlist(productId, variantId).subscribe({
        next: () => {
          this.wishlistIds = this.wishlistIds.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          );
          this.toastr.warning('Removed from wishlist');
          // console.log('❌ Removed from wishlist:', { productId, variantId });
        },
        error: (err) => {
          this.toastr.error('Error removing from wishlist');
          // console.error('❌ Error removing from wishlist', err);
        }
      });
    } else {
      this.wishlistService.addToWishlist(productId, variantId).subscribe({
        next: () => {
          this.wishlistIds.push({ productId, variantId });
          this.toastr.success('Added to wishlist');
          // console.log('✅ Added to wishlist:', { productId, variantId });
        },
        error: (err) => {
          this.toastr.error('Error adding to wishlist');
          // console.error('❌ Error adding to wishlist', err);
        }
      });
    }
  }



  onProductClick() {
    sessionStorage.setItem('shopScrollY', String(window.scrollY));
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
    if (!product.selectedVariant && product.variants?.length) {
      product.selectedVariant = product.variants[0];
    }

    this.addToCart.emit(product);
  }



}
