import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShippingMethodService {
  private baseUrl = `${environment.apiBaseUrl}/shipping-method`;

  constructor( private http: HttpClient ) {}

  getShippingMethods(pincode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${pincode}`, );
  }



}
