// src/app/services/cart.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })

export class CartService {
 private baseUrl = `${environment.apiBaseUrl}/cart`;

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  private cartCache: any = null; // ✅ for caching
  private cartLoading = false;
  private cartObservers: ((data: any) => void)[] = [];

  constructor(private http: HttpClient) { }

  // ✅ GET full cart (cached)
  getCart(): Observable<any> {
    if (this.cartCache) {
      return of(this.cartCache); // return from cache
    }

    if (this.cartLoading) {
      return new Observable(observer => {
        this.cartObservers.push((data) => {
          observer.next(data);
          observer.complete();
        });
      });
    }

    this.cartLoading = true;
    return new Observable(observer => {
      this.http.get<any>(`${this.baseUrl}`, { withCredentials: true }).subscribe({
        next: (res) => {
          this.cartCache = res;
          const count = res.items?.length || 0;
          this.cartCountSubject.next(count);
          observer.next(res);
          observer.complete();

          this.cartObservers.forEach(cb => cb(res));
          this.cartObservers = [];
          this.cartLoading = false;
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
          this.cartLoading = false;
        }
      });
    });
  }

  // ✅ Used to refresh after add/remove/update
  private refreshCartCount(): void {
    this.cartCache = null;
    this.getCart().subscribe((cart) => {
      const uniqueCount = cart?.items?.length || 0;
      this.cartCountSubject.next(uniqueCount);
    });
  }

  // ✅ Triggered after login to merge guest cart
  mergeGuestCartAfterLogin() {
    return this.http.post(`${this.baseUrl}/merge`, {}, { withCredentials: true }).pipe(
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
    ).pipe(
      tap(() => this.refreshCartCount())
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
