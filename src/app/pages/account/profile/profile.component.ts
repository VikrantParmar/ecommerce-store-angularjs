import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationMessageComponent } from '../../../shared/notification-message/notification-message.component';

@Component({
  imports: [FormsModule, CommonModule, NotificationMessageComponent],
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  role: string = '';
  updatedUsername: string = '';
  editing: boolean = false;

  loading: boolean = true;
  error: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        this.username = res.data.username;
        this.email = res.data.email;
        this.role = res.data.role;
        this.updatedUsername = this.username;
        this.loading = false;
     },
      error: (err) => {
        this.error = err.error?.message || 'Failed to fetch profile';
        this.loading = false;
      }
    });
  }

  enableEdit() {
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
    this.updatedUsername = this.username; // reset changes
  }

  updateProfile(): void {
    const updatedData = { username: this.updatedUsername };

    this.userService.updateUserProfile(updatedData).subscribe({
      next: (res) => {
        this.successMessage = 'Profile updated successfully!';
        this.error = '';
        this.username = this.updatedUsername;
        this.editing = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Profile update failed';
        this.successMessage = '';
      },
    });
  }
}
