import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:4040/api/products';
  private baseUrl = 'http://localhost:4040/uploads';


  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getAllProducts(params: any): Observable<any> {
    let httpParams = new HttpParams()
      // .set('categoryId', params.categoryId)
      .set('page', params.page)
      .set('limit', params.limit)
      .set('sortField', params.sortField)
      .set('sortOrder', params.sortOrder);
    // console.log(params)

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.categoryId != null) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }

    return this.http.get(this.apiUrl, { params: httpParams });
  }

  createProduct(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
      // Do NOT set Content-Type here
    });
    return this.http.post(this.apiUrl, data, { headers });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders());
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }


  getImageUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }


}

