import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise = loadStripe(environment.stripePublishableKey);

  private baseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  createPaymentIntent(data: { orderId:number; amount: number; products: any[] }) {
    return this.http.post<{ clientSecret: string }>(`${this.baseUrl}/payment`, data);
  }

// orderId: number;

  updatePaymentStatus(paymentIntentId: string) {
    return this.http.post(`${this.baseUrl}/update-status`, { paymentIntentId });
  }

  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }

  async createSubscription() {
    try {
      const response = await this.http.post<{ url: string }>(`${this.baseUrl}/create-subscription`, {}).toPromise();
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        console.error('No URL returned from subscription API');
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
    }
  }

  markPrimeUser(sessionId: string) {
    return this.http.post(`${this.baseUrl}/mark-prime`, { sessionId });
  }

  setAutoCancel(sessionId: string) {
    return this.http.post(`${this.baseUrl}/set-auto-cancel`, { sessionId });
  }


  createSubscriptionDirect(subscriptionData: {
    amount: number;
    interval: string;
    name: string;
    description: string;
    paymentMethodId: string;
  }) {
    return this.http.post<any>(`${this.baseUrl}/prime-payment`, subscriptionData);
  }



}

