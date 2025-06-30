// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationMessageComponent } from '../../shared/notification-message/notification-message.component';

@Component({
  imports: [FormsModule,CommonModule, NotificationMessageComponent],
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  role: string = '';            // Add role property
  updatedUsername: string = '';
  updatedEmail: string = '';
  updatedPassword: string = '';
  error: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        this.username = res.data.username;
        this.email = res.data.email;
        this.role = res.data.role;  // Get role from API response
        this.updatedUsername = this.username;
        this.updatedEmail = this.email;
      },
     error: (err) => {
      if (err.status === 401 && err.error?.name === 'TokenExpiredError') {
        alert('Session expired, please login again.');
        this.router.navigate(['/login']);
      } else {
        this.error = err.error.message || 'Failed to fetch profile';
      }
    }
  });

  }

  updateProfile(): void {
    const updatedData: any = {
      username: this.updatedUsername,
      email: this.updatedEmail,
    };

    // Only add password if user entered a new one
    if (this.updatedPassword.trim()) {
      updatedData.password = this.updatedPassword;
    }

    this.userService.updateUserProfile(updatedData).subscribe({
      next: (res) => {
        this.successMessage = 'Profile updated successfully!';
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.message || 'Profile update failed';
        this.successMessage = '';
      },
    });
  }
}
