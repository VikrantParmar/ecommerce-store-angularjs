// src/app/services/promo.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { buildHttpQueryParams, TableQueryParams } from '../shared/utils/query-param-builder/query-param-builder.component';

export interface PromoCode {
  id?: number;
  code: string;
  discountType: 'percentage' | 'flat'; // NEW
  discountValue: number;               // NEW
  startDate: string
  expiryDate: string; // ISO string
  maxUsage?: number;
  usedCount?: number;
  active: boolean;
}

export interface ApplyPromoResponse {
  success: boolean;
  code: string;
  discount: number;
  newTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class PromoService {
  private baseUrl = 'http://localhost:4040/api/promo';

  constructor(private http: HttpClient) { }

  getAll(params?: TableQueryParams): Observable<{ data: PromoCode[]; total: number }> {
    const httpParams = buildHttpQueryParams(params || {});
    return this.http.get<{ data: PromoCode[]; total: number }>(this.baseUrl, { params: httpParams });
  }


  create(promo: PromoCode): Observable<PromoCode> {
    return this.http.post<PromoCode>(this.baseUrl, promo);
  }

  update(id: number, promo: PromoCode): Observable<PromoCode> {
    return this.http.put<PromoCode>(`${this.baseUrl}/${id}`, promo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


}
