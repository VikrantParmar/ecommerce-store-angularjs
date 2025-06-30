import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.css']
})
export class NotificationMessageComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
}
