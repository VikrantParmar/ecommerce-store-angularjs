import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { getFieldError } from '../../shared/form-validation.helper/form-validation.helper.component';
import { NotificationMessageComponent } from '../../shared/notification-message/notification-message.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, NotificationMessageComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  submitted = false;

  successMessage = '';
  errorMessage = '';
  backendErrors: { [key: string]: string } = {};

  getFieldError = getFieldError;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cartService: CartService
  ) {}

  onLogin(form: NgForm) {
    this.submitted = true;
    this.backendErrors = {};
    this.successMessage = '';
    this.errorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.authService.saveUser(res.data);

        const role = this.authService.getUserRole() || 'user';


        if (role === 'admin') {
          this.loading = false;
          this.authService.logout(); // Remove token
          this.errorMessage = 'Admin is not allowed to login here.';
          return;
        }

        // Proceed for user
        this.cartService.mergeGuestCartAfterLogin().subscribe({
          next: () => {
            this.cartService.getCart().subscribe(() => {
              this.loading = false;
              this.successMessage = 'Login successful!';
              this.router.navigate(['/']);
              this.toastr.success('Login successful!', 'Welcome');
            });
          },
          error: () => {
            this.cartService.getCart().subscribe(() => {
              this.loading = false;
              this.successMessage = 'Login successful!';
              this.router.navigate(['/']);
              this.toastr.success('Login successful!', 'Welcome');
            });
          }
        });
      },
      error: (err) => {
        this.loading = false;

        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          err.error.errors.forEach((e: any) => {
            const field = e.path || e.field || 'general';
            this.backendErrors[field] = e.msg;
          });
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }
}
