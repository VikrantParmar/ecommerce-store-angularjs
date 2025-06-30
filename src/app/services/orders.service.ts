import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { buildHttpQueryParams, TableQueryParams } from '../shared/utils/query-param-builder/query-param-builder.component';

export interface OrderSummary {
  id: number;
  orderNumber: string;
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:4040/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(orderData: {
    uniqueId: string; // guest ya logged in dono ke liye
    items: { productId: number; quantity: number }[];
    subtotal: number;
    discount: number;
    total: number;
    promoCode?: string | null;
  }): Observable<any> {
    return this.http.post(this.baseUrl, orderData, { withCredentials: true });
  }

  // New method to get logged-in user's orders
  getUserOrders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.baseUrl}/my-orders`, { withCredentials: true });
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/my-orders/${orderId}`, { withCredentials: true });
  }

  getAllOrders(params: TableQueryParams = {}): Observable<any> {
    const httpParams = buildHttpQueryParams(params);
    return this.http.get<any>(`${this.baseUrl}/admin/orders`, {
      params: httpParams,
      withCredentials: true,
    });
  }


  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/orders/${orderId}/status`, { status }, { withCredentials: true });
  }

  // ✅ NEW: Delete order
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/orders/${orderId}`, { withCredentials: true });
  }


}
