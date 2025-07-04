import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TableQueryParams,
  buildHttpQueryParams,
} from '../shared/utils/query-param-builder/query-param-builder.component';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private baseUrl = 'http://localhost:4040/api/blog'; // Updated to be consistent

  constructor(private http: HttpClient) {}

  createBlog(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  getAllBlogs(params: TableQueryParams = {}): Observable<any> {
    const httpParams = buildHttpQueryParams(params);
    return this.http.get<any>(this.baseUrl, { params: httpParams });
  }

  updateBlog(id: number | string, data: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteBlog(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
