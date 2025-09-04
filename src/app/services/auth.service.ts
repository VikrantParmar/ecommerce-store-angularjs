import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';
import { WishlistService } from './wishlist.service';



@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private baseUrl = `${environment.apiBaseUrl}/cart`;


  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();



  // Add a BehaviorSubject for userRole
  private userRole = new BehaviorSubject<string | null>(this.getUserRole());
  userRole$ = this.userRole.asObservable();

  constructor(private http: HttpClient, private router: Router, private cartService: CartService,
    private wishlistService: WishlistService
  ) { }



  mergeGuestCartAfterLogin() {
  return this.http.post(`${this.baseUrl}/merge`, {}, { withCredentials: true });
  }



  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email`, {
      params: { token },
    });
  }

  forgotPassword(data: { email: string }) {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: { token: string, newPassword: string, confirmPassword: string }) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }




  isTokenExpired(token: string): boolean {
    if (!token) return true;
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  }

  checkToken(): void {
    const user = this.getCurrentUser();
    if (!user) {
      this.logout();
      this.router.navigate(['/signin']);
      return;
    }

    if (this.isTokenExpired(user.accessToken)) {
      this.refreshToken().subscribe({
        next: (res) => {
          const updatedUser = {
            ...user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('🔄 Access token refreshed.');
        },
        error: () => {
          this.logout();
          this.router.navigate(['/login']);
        },
      });
    }
  }



  saveUser(loginResponse: any, wishlistService?: WishlistService, cartService?: CartService) {
  const { accessToken, refreshToken, user } = loginResponse;

  const decoded: any = jwtDecode(accessToken);
  const role = decoded?.role?.toLowerCase() || null;

  const fullUser = {
    accessToken,
    refreshToken,
    user,
    role,
  };

  localStorage.setItem('user', JSON.stringify(fullUser));
  this.loggedIn.next(true);
  this.userRole.next(role);

  // ✅ login ke turant baad wishlist & cart load karo
  if (wishlistService) {
    wishlistService.getWishlist().subscribe();
  }

  if (cartService) {
    cartService.getCart().subscribe();
  }
}



  getAccessToken(): string | null {
    const user = this.getCurrentUser();
    return user?.accessToken || null;
  }

  refreshToken(): Observable<any> {
    const user = this.getCurrentUser();
    // console.log('🔁 Refresh token:', user?.refreshToken);

    return this.http.post(`${this.apiUrl}/refresh-token`, {
      refreshToken: user?.refreshToken,
    });
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role?.toLowerCase() || null;
  }


  public hasToken(): boolean {
    const user = this.getCurrentUser();
    return !!user?.accessToken;
  }

  logout(): void {
    const user = this.getCurrentUser();

    // Call backend logout only if user is logged in
    if (user) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }).subscribe({
        next: () => console.log('🔌 Logged out from server'),
        error: () => console.log('❌ Server logout failed'),
      });
    }

    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.userRole.next(null);
  }

  isLoggedIn(): boolean {
  return this.loggedIn.getValue();
}


}
