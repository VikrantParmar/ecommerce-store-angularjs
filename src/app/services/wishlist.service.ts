import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private apiUrl = `${environment.apiBaseUrl}/wishlist`;

  constructor(private http: HttpClient) { }

  getWishlist(): Observable<any> {
    return this.http.get(this.apiUrl)
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(this.apiUrl, { productId });
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }



}


