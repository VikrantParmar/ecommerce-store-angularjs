import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })


export class OrderReturnService {


  private baseUrl = `${environment.apiBaseUrl}/order-returns`;

  constructor(private http: HttpClient) {}

  createReturn(orderId: number, reason: string, comment?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, { orderId, reason, comment }, { withCredentials: true });
  }

  getUserReturns(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my`, { withCredentials: true });
  }

  
}
