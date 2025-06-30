import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { getFieldError } from '../../shared/form-validation.helper/form-validation.helper.component';
import { NotificationMessageComponent } from '../../shared/notification-message/notification-message.component';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, NotificationMessageComponent ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;

  successMessage = '';
  errorMessage = '';
  backendErrors: { [key: string]: string } = {};

  getFieldError = getFieldError;

  constructor(private authService: AuthService, private toastr: ToastrService) {}

  onSubmit(form: NgForm) {
    this.submitted = true;
    this.backendErrors = {};
    this.successMessage = '';
    this.errorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Reset link sent to your email!';
        form.resetForm();
        this.submitted = false;
      },
      error: (err) => {
        this.loading = false;

        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          err.error.errors.forEach((e: any) => {
            const field = e.path || e.field || 'email';
            this.backendErrors[field] = e.msg;
          });
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      },
    });
  }
}
