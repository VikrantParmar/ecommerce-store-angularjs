// src/app/services/cart.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:4040/api/cart';

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ✅ GET full cart (used to get items and update count)
  getCart(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`, { withCredentials: true }).pipe(
      tap((res) => {
        const count = res.items?.length || 0; // ✅ Unique product count only
        this.cartCountSubject.next(count);
      })
    );
  }

  // ✅ Triggered after login to merge guest cart
  mergeGuestCartAfterLogin() {
    return this.http.post('/api/cart/merge', {}, { withCredentials: true }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  // ✅ Add item to cart
  addToCart(productId: number, quantity = 1): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/`,
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  // ✅ Update quantity of an item
  updateCartItem(productId: number, quantity: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/`,
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  // ✅ Remove item from cart
  removeCartItem(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`, {
      withCredentials: true,
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  // ✅ Count only unique products
  private refreshCartCount(): void {
    this.getCart().pipe(
      tap((cart) => {
        const uniqueCount = cart.items?.length || 0;
        this.cartCountSubject.next(uniqueCount);
      })
    ).subscribe();
  }

  // ✅ (Optional) total quantity if needed anywhere
  private getTotalQuantity(items: any[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  // ✅ Apply promo code
  applyPromoCode(code: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/apply`,
      { code },
      { withCredentials: true }
    );
  }

  // ✅ Remove promo code
  removePromoCode(): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/remove`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }
}
