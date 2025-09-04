import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderTrackingService {
  private baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}


  getOrderTracking(orderId: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tracking/${orderId}`);
  }

}
