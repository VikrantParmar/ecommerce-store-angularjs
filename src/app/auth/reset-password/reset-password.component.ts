import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { getFieldError } from '../../shared/form-validation.helper/form-validation.helper.component';
import { NotificationMessageComponent } from '../../shared/notification-message/notification-message.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationMessageComponent],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  token = '';
  loading = false;
  submitted = false;
  passwordMismatch = false;

  // ✅ Required for notification component
  successMessage = '';
  errorMessage = '';

  backendErrors: { [key: string]: string } = {};
  getFieldError = getFieldError;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(form: NgForm) {
    this.submitted = true;
    this.backendErrors = {};
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordMismatch = this.newPassword !== this.confirmPassword;

    Object.values(form.controls).forEach(control => control.markAsTouched());

    if (form.invalid || this.passwordMismatch) return;

    this.loading = true;

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successfully!';
        this.toastr.success(this.successMessage);
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = '';
        this.successMessage = '';

        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          err.error.errors.forEach((e: any) => {
            const field = e.path || e.field || 'general';
            this.backendErrors[field] = e.msg;
          });
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
