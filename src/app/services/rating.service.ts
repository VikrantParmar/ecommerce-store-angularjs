import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private baseUrl = `${environment.apiBaseUrl}/ratings`;

  constructor(private http: HttpClient) {}

  // Create a new rating
  createRating(data: { productId: number; variantId?: number; rating: number; review?: string; }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  // Get all ratings for a product
  getProductRatings(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${productId}`);
  }
}
