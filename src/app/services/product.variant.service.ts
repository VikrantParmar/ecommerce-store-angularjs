import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TableQueryParams,
  buildHttpQueryParams,
} from '../shared/utils/query-param-builder/query-param-builder.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private apiUrl = `${environment.apiBaseUrl}/product-variants`;


  constructor(private http: HttpClient) { }

  createVariant(data: {
    product_id: number;
    price: number;
    stock: number;
    attribute_values: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  getAllVariants(params: TableQueryParams = {}): Observable<any> {
    const httpParams = buildHttpQueryParams(params);
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getVariantsByProduct(product_id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${product_id}`);
  }

  updateVariant(
    id: number | string,
    data: {
      price: number;
      stock: number;
      attribute_values?: string[];
    }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteVariant(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}



