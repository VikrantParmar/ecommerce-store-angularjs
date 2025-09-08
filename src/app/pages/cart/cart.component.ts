import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/products.service';
import { PromoService } from '../../services/promo.service';
import { Router, RouterLink } from '@angular/router';
import { CartListingComponent } from '../../components/cart/cart-listing/cart-listing.component';
import { CartPromoComponent } from '../../components/cart/cart-promo/cart-promo.component';
import { CartSummaryComponent } from '../../components/cart/cart-summary/cart-summary.component';
import { ToastrService } from 'ngx-toastr';


declare var bootstrap: any;


@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink, CartListingComponent, CartPromoComponent, CartSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  selectedProductId: number | null = null;

  promoCode: string = '';
  discount: number = 0;
  newTotal: number = 0;
  promoMessage: string = '';
  promoError: string = '';
  promoApplying: boolean = false;
  discountType: string = '';
  discountValue: number = 0; // 👈 new variable

  loadingItemId: number | null = null;


  imagePath: string = "images/empty-cart.svg";

  cartSummary = {
    subtotal: 0,
    discountAmount: 0,
    totalPayable: 0,
    promoCode: null as string | null,
    promoCodeDetails: null as { discountType: string; discountValue: number } | null,
  };


  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private promoService: PromoService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCart(true);
  }

  loadCart(force: boolean = false) {
    this.loading = true;
    this.cartService.getCart(force).subscribe({
      next: (res) => {
        this.cartItems = res.items;
        this.cartSummary = res.summary || this.cartSummary;
        this.promoCode = this.cartSummary.promoCode || '';
        this.discount = this.cartSummary.discountAmount || 0;
        this.newTotal = this.cartSummary.totalPayable || this.cartSummary.subtotal || 0;

        if (this.cartSummary.promoCodeDetails) {
          this.discountType = this.cartSummary.promoCodeDetails.discountType;
          this.discountValue = this.cartSummary.promoCodeDetails.discountValue;
        } else {
          this.discountType = '';
          this.discountValue = 0;
        }

        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }


  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      this.loadingItemId = item.Product.id;
      this.updateQuantity(item.Product.id, item.variant?.id, item.quantity - 1); // ✅ pass variantId
    }
  }

  increaseQuantity(item: any) {
    this.loadingItemId = item.Product.id;
    this.updateQuantity(item.Product.id, item.variant?.id, item.quantity + 1); // ✅ pass variantId
  }

  updateQuantity(productId: number, variantId: number | null | undefined, quantity: number) {
    if (quantity < 1) return;

    this.cartService.updateCartItem(productId, quantity, variantId ?? undefined).subscribe({
      next: () => {
        this.cartService['refreshCartCount']();
        this.loadCart();
      },
      error: (err) => {
        console.error('Update failed:', err);
      },
      complete: () => {
        this.loadingItemId = null;
      }
    });
  }


  removeItem(productId: number, variantId?: number) {
    this.cartService.removeCartItem(productId, variantId).subscribe(() => {
      this.loadCart();
      this.toastr.success('Product removed');
      this.cartService['refreshCartCount']();
    });
  }

  // getImageUrl(filename: string): string {
  //   return this.productService.getImageUrl(filename);
  // }

  openConfirmModal(productId: number): void {
    this.selectedProductId = productId;
    const modalEl = document.getElementById('confirmDeleteModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  confirmDelete(): void {
    if (this.selectedProductId !== null) {
      const selectedItem = this.cartItems.find(item => item.Product.id === this.selectedProductId);
      const variantId = selectedItem?.variant?.id || null;

      this.removeItem(this.selectedProductId, variantId);
      this.selectedProductId = null;
    }

    const modalEl = document.getElementById('confirmDeleteModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  }


  getTotalQuantity(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.variant?.price ?? item.Product.price ?? 0);
      return total + item.quantity * price;
    }, 0);
  }


  applyPromo(): void {
    const total = this.getTotalPrice();

    if (!this.promoCode.trim()) {
      this.promoError = 'Please enter a promo code.';
      this.promoMessage = '';
      return;
    }

    this.promoApplying = true;

    this.cartService.applyPromoCode(this.promoCode).subscribe({
      next: (res) => {
        this.promoApplying = false;

        if (res.success) {
          const { discountType, discountValue } = res;

          let discountAmount = 0;
          if (discountType === 'percentage') {
            discountAmount = (total * discountValue) / 100;
          } else if (discountType === 'flat') {
            discountAmount = discountValue;
          }

          this.discount = discountAmount;
          this.discountType = discountType;
          this.discountValue = discountValue;

          this.newTotal = total - discountAmount;

          this.promoError = '';
        } else {
          // This block is unlikely to be reached with the current backend implementation
          this.resetPromo();
          this.promoError = 'Promo code not valid.';
        }
      },
      error: (err) => {
        this.promoApplying = false;
        this.resetPromo();

        // Extract the error message from the backend response
        const errorMessage = err.error?.error || err.error?.message || 'Failed to apply promo code.';
        this.promoError = errorMessage;
      },
    });
  }

  resetPromo(): void {
    this.discount = 0;
    this.newTotal = 0;
    this.discountType = ''; // reset it here
    this.discountValue = 0; // 👈 reset here


    this.promoMessage = '';
  }

  resetPromoMessages(): void {
    this.promoMessage = '';
    this.promoError = '';
  }

  getDiscountedTotal(): number {
    return this.newTotal || this.getTotalPrice();
  }

  removePromoCode() {
    this.cartService.removePromoCode().subscribe({
      next: (res) => {
        this.resetPromo();
        this.promoCode = '';
        this.resetPromoMessages();
        this.loadCart();
      },
      error: (err) => {
        console.error('Failed to remove promo code:', err);
        this.promoError = 'Failed to remove promo code.';
      },
    });
  }


  goToCheckout() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Your cart is empty.');
      return;
    }

    const hasOutOfStock = this.cartItems.some(item => {
      const variantStock = item.variant?.stock;
      const productStock = item.Product?.stock;
      const availableStock = variantStock ?? productStock;

      return !availableStock || item.quantity > availableStock;
    });

    if (hasOutOfStock) {
      this.toastr.warning('Some products in your cart are out of stock or exceed available quantity.');
      return;
    }

    this.router.navigate(['/checkout']);
  }


}



