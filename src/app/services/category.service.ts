import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:4040/api/categories';

  constructor(private http: HttpClient) {}

 getCategories(params: any): Observable<any> {
  let httpParams = new HttpParams()
    .set('page', params.page)
    .set('limit', params.limit)
    .set('sortField', params.sortField)
    .set('sortOrder', params.sortOrder);

  if (params.search?.trim()) {
    httpParams = httpParams.set('search', params.search.trim());
  }

  // ✅ Include onlyWithProducts flag if true
  if (params.onlyWithProducts === true) {
    httpParams = httpParams.set('onlyWithProducts', 'true');
  }

  return this.http.get(this.apiUrl, { params: httpParams });
}



  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
