import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { buildHttpQueryParams, TableQueryParams } from '../shared/utils/query-param-builder/query-param-builder.component';
import { environment } from '../../environments/environment';

export interface PaymentSummary {
  id: number;
  amount: number;
  refundStatus?: 'initiated' | 'refunded' | 'succeeded' | null;
  refundedAt?: string | null;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  invoicePdfUrl?: string;
  payments?: PaymentSummary[]; 

}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.baseUrl, orderData, { withCredentials: true });
  }

  getUserOrders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.baseUrl}/my-orders`, { withCredentials: true });
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/my-orders/${orderId}`, { withCredentials: true });
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${orderId}/invoice`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  cancelOrder(orderId: number, reason: string, comment?: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/cancel/${orderId}`,
      { reason, comment },
      { withCredentials: true }
    );
  }


  getCancellationReasons(): Observable<{ reasons: string[] }> {
    return this.http.get<{ reasons: string[] }>(`${this.baseUrl}/cancellation-reasons`, {
      withCredentials: true,
    });
  }
}
