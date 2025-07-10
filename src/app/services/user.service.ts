import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/user`;

  constructor(private http: HttpClient) { }


  getUserProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }


  updateUserProfile(updatedData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put(`${this.apiUrl}/profile`, updatedData, { headers });
  }


  private getToken(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || '';
  }


  getSavedAddresses(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.apiUrl}/address`, { headers });
  }

}
