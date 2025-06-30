import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getFieldError, setValidationMode } from '../../shared/form-validation.helper/form-validation.helper.component';
import { NotificationMessageComponent } from '../../shared/notification-message/notification-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationMessageComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;
  submitted = false;

  successMessage = '';
  errorMessage = '';
  backendErrors: { [key: string]: string } = {};

  getFieldError = getFieldError;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(form: NgForm) {
    this.submitted = true;
    this.backendErrors = {};
    this.successMessage = '';
    this.errorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.loading = true;

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Registration successful! Please check your email to verify your account.';
        form.resetForm();
        this.submitted = false;

        // this.router.navigate(['/signin']);
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
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }
}
