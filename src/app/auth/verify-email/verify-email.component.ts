import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  message = 'Verifying your email...';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  const token = this.route.snapshot.queryParamMap.get('token');
  if (token) {
    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.message = 'Email verified successfully!';
        this.toastr.success('Email verified! You can now log in.');
        this.router.navigate(['/signin']); // 🔄 immediately navigate
      },
      error: (err) => {
        this.message = err?.error?.message || 'Email verification failed.';
        this.toastr.error(this.message);
        this.loading = false;
      }
    });
  } else {
    this.message = 'Invalid or missing verification token.';
    this.toastr.error(this.message);
    this.loading = false;
  }
}

}
