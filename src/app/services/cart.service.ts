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

  private cartCache: any = null;
  private cartLoading = false;
  private cartObservers: ((data: any) => void)[] = [];

  constructor(private http: HttpClient) { }

  getCart(): Observable<any> {
    if (this.cartCache) {
      return of(this.cartCache);
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

  private refreshCartCount(): void {
    this.cartCache = null;
    this.getCart().subscribe((cart) => {
      const uniqueCount = cart?.items?.length || 0;
      this.cartCountSubject.next(uniqueCount);
    });
  }

  mergeGuestCartAfterLogin() {
    return this.http.post(`${this.baseUrl}/merge`, {}, { withCredentials: true }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  addToCart(payload: { productId: number; variantId?: number; quantity: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/`,
      payload,
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }


  updateCartItem(productId: number, quantity: number, variantId?: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/`,
      { productId, quantity, variantId },
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }


  // removeCartItem(productId: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}/${productId}`, {
  //     withCredentials: true,
  //   }).pipe(
  //     tap(() => this.refreshCartCount())
  //   );
  // }
  removeCartItem(productId: number, variantId?: number): Observable<any> {
    const params: any = { productId };
    if (variantId != null) params.variantId = variantId;

    return this.http.delete(`${this.baseUrl}/${productId}`, {
      params,
      withCredentials: true,
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }



  private getTotalQuantity(items: any[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  applyPromoCode(code: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/apply`,
      { code },
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  removePromoCode(): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/remove`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clear`);
  }
}
