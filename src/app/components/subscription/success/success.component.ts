import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  message = '';
  error = '';
  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];

      if (sessionId) {

        this.paymentService.setAutoCancel(sessionId).subscribe({
          next: () => {
            console.log('Auto cancel set successfully');
          },
          error: err => {
            console.error('Failed to set auto cancel:', err);
          }
        });

        // Mark user as Prime member
        this.paymentService.markPrimeUser(sessionId).subscribe({
          next: () => {
            this.message = 'Congrats! You are now a Prime member.';
          },
          error: (err) => {
            this.error = 'Could not mark as Prime member. Please contact support.';
            console.error(err);
          }
        });
      } else {
        this.error = 'No session ID found in URL.';
      }
    });
  }
}
