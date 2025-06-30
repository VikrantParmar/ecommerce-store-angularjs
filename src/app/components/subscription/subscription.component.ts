import { Component } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-subscription',
  imports: [CommonModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  constructor(
    private paymentService: PaymentService,
     private authService: AuthService,
     private router: Router
  ) {}

  subscribe() {
    if (!this.authService.getCurrentUser()?.accessToken) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/prime' } });
      return;
    }

    this.paymentService.createSubscription();
  }


  goToPayment(name: string, amount: number, interval: string, description: string) {
    if (!this.authService.getCurrentUser()?.accessToken) {
      this.router.navigate(['/login'], { queryParams: { redirect: `/subscribe/${name}` } });
      return;
    }
    this.router.navigate(['/subscribe', name], {
      queryParams: { amount, interval, description }
    });
  }
}
