import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './services/auth.service'; // Adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        }
        // Redirect to login if not logged in
        return this.router.createUrlTree(['/signin']);
      })
    );
  }
}
