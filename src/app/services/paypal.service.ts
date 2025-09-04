import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  private baseUrl = `${environment.apiBaseUrl}/paypal`;

  constructor(private http: HttpClient) {}

  // Create PayPal order
  createPaypalOrder(total: number, orderId:number): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-paypal-order`, { total, orderId });
  }

  // Capture PayPal order
  captureOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/capture-order`, { orderId });
  }
}
 