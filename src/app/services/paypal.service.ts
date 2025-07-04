import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  private baseUrl = 'http://localhost:4040/api/paypal';

  constructor(private http: HttpClient) {}

  // Create PayPal order
  createOrder(total: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-paypal-order`, { total });
  }

  // Capture PayPal order
  captureOrder(orderID: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/capture-order`, { orderID });
  }
}
