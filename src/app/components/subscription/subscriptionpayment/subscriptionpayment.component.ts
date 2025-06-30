import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-subscriptionpayment',
  imports: [CommonModule],
  templateUrl: './subscriptionpayment.component.html',
  styleUrl: './subscriptionpayment.component.css'
})
export class SubscriptionpaymentComponent implements OnInit, OnDestroy {
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  errorMessage = '';
  loading = false;

  planName = '';
  amount = 0;
  interval = '';
  description = '';

  private querySub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private authService: AuthService,
    public router: Router
  ) { }

  async ngOnInit() {
    this.planName = this.route.snapshot.paramMap.get('planName') || '';

    this.stripe = await loadStripe(environment.stripePublishableKey);

    this.querySub = this.route.queryParams.subscribe(params => {
      this.amount = +params['amount'] || 0;
      this.interval = params['interval'] || 'month';
      this.description = params['description'] || '';
    });

    if (!this.authService.getCurrentUser()?.token) {
      this.router.navigate(['/login'], { queryParams: { redirect: `/subscribe/${this.planName}` } });
      return;
    }

    this.stripe = await loadStripe(environment.stripePublishableKey);
    if (!this.stripe) {
      this.errorMessage = 'Stripe failed to load.';
      return;
    }
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
    this.card?.unmount();
  }

  async pay() {
    if (!this.stripe || !this.card) return;

    this.loading = true;
    this.errorMessage = '';

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });

    if (error) {
      this.errorMessage = error.message || 'Failed to create payment method.';
      this.loading = false;
      return;
    }

    this.paymentService.createSubscriptionDirect({
      amount: this.amount,
      interval: this.interval,
      name: this.planName,
      description: this.description,
      paymentMethodId: paymentMethod.id
    }).subscribe(async (res) => {
      this.loading = false;

      if (res.clientSecret) {
        // If clientSecret present, confirm the payment intent
        const result = await this.stripe!.confirmCardPayment(res.clientSecret, {
          payment_method: {
            card: this.card!,
          },
        });

        if (result.error) {
          this.errorMessage = result.error.message || 'Payment failed.';
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          // alert('Subscription successful!');
          this.router.navigate(['/success']);
        }
      } else if (res.status === 'active' || res.status === 'trialing') {
        // No clientSecret but subscription is active or trialing => success
        // alert('Subscription successful!');
        this.router.navigate(['/success']);
      } else {
        this.errorMessage = 'Payment client secret missing.';
      }

    }, () => {
      this.errorMessage = 'Subscription creation failed. Please try again.';
      this.loading = false;
    });
  }
}

