import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private apiUrl = `${environment.apiBaseUrl}/wishlist`;

  constructor(private http: HttpClient) { }

  getWishlist(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addToWishlist(productId: number, variantId?: number): Observable<any> {
    const body: any = { productId };
    if (variantId != null) { // covers both undefined and null
      body.variantId = variantId;
    }
    return this.http.post(this.apiUrl, body);
  }

  removeFromWishlist(productId: number, variantId: number | null = null): Observable<any> {
  let params = new HttpParams();
  params = params.set('variantId', variantId !== null ? variantId.toString() : 'null');
  return this.http.delete(`${this.apiUrl}/${productId}`, { params });
}




}
