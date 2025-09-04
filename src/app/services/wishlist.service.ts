import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  static getWishlist() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.apiBaseUrl}/wishlist`;

  private wishlistCountSubject = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  getWishlist(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((res: any) => {
        const count = Array.isArray(res?.data) ? res.data.length : res?.length || 0;
        this.wishlistCountSubject.next(count);
      })
    );
  }

  addToWishlist(productId: number, variantId?: number): Observable<any> {
    const body: any = { productId };
    if (variantId != null) {
      body.variantId = variantId;
    }
    return this.http.post(this.apiUrl, body).pipe(
      tap(() => {
        this.getWishlist().subscribe();
      })
    );
  }

  removeFromWishlist(productId: number, variantId: number | null = null): Observable<any> {
    let params = new HttpParams();
    params = params.set('variantId', variantId !== null ? variantId.toString() : 'null');
    return this.http.delete(`${this.apiUrl}/${productId}`, { params }).pipe(
      tap(() => {
        this.getWishlist().subscribe();
      })
    );
  }
}
