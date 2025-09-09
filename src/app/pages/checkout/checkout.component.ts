import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/products.service';
import { OrderService } from '../../services/orders.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { formatPrice } from '../../constants/currency.constant';
import { getFieldError } from '../../shared/form-validation.helper/form-validation.helper.component';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ShippingMethodComponent } from "../../components/shipping-method/shipping-method.component";
import { PaypalService } from '../../services/paypal.service';



declare var paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ShippingMethodComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  backendErrors: { [key: string]: string } = {};
  getFieldError = getFieldError;
  format = formatPrice;
  sameAsShipping: boolean = false;
  cartItems: any[] = [];
  subtotal = 0;
  discount = 0;
  total = 0;
  promoCode: string | null = null;
  discountType: string = '';
  discountValue: number = 0;
  submitted = false;
  stripe: any = null;
  card: StripeCardElement | null = null;
  selectedPayment: 'Stripe' | 'Paypal' | 'COD' = 'Stripe';
  paypalRendered = false;
  cardError: string = '';
  loading = false;
  pageLoading = true;
  successMessage = '';
  selectedShippingMethod: any = null;

  shippingAddress = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  };

  billingAddress = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  };

  cardComplete: boolean = false;


  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    private paymentService: PaymentService,
    private paypalService: PaypalService,
    private userService: UserService,
    private toastr: ToastrService

  ) { }

  ngOnInit(): void {
    this.userService.getSavedAddresses().subscribe({
      next: (res) => {
        if (res.shipping?.length > 0) {
          this.shippingAddress = res.shipping[0];
        }
        // if (res.billing?.length > 0) {
        //   this.billingAddress = res.billing[0];
        // }


      },
      error: (err) => {
        console.warn('No saved address found', err);
      }
    });
    this.loadCartDetails();
    this.setupStripe();
    this.loadPayPalScript().then(() => {
      this.setupPayPal();
    });
  }

  ngAfterViewChecked(): void {
    if (this.selectedPayment === 'Paypal' && !this.paypalRendered) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        this.setupPayPal();
      }
    }
  }


  getCartImageUrl(item: any): string {
    if (item.variant?.images?.length > 0) {
      return this.productService.getVariantImageUrl(item.variant.images[0].image_url);
    }

    return this.productService.getImageUrl(item.Product?.img);
  }


  loadCartDetails() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cartItems = res.items || [];
        this.subtotal = res.summary?.subtotal || 0;
        this.discount = res.summary?.discountAmount || 0;
        this.total = res.summary?.totalPayable || 0;
        this.promoCode = res.summary?.promoCode || null;

        if (res.summary?.promoCodeDetails) {
          this.discountType = res.summary.promoCodeDetails.discountType;
          this.discountValue = res.summary.promoCodeDetails.discountValue;
        } else {
          this.discountType = '';
          this.discountValue = 0;
        }

        this.pageLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.pageLoading = false;
      }
    });
  }


  async setupStripe() {
    this.stripe = await this.paymentService.getStripe();
    const elements = this.stripe.elements();

    // Only create new card element if not already created
    if (!this.card) {
      this.card = elements.create('card');
      this.card?.on('change', (event: any) => {
        this.cardComplete = event.complete;
      });
    }

    this.mountStripeCard();
  }

  mountStripeCard() {
    const container = document.getElementById('card-element');

    if (!container || !this.card) {
      setTimeout(() => this.mountStripeCard(), 100);
      return;
    }

    try {
      container.innerHTML = '';
      this.card.mount('#card-element');
    } catch (err) {
      console.warn('Stripe card mount error:', err);
    }
  }

  async placeOrder(form: NgForm) {
    this.submitted = true;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    let uniqueId: string;

    if (storedUser?.user?.id) {
      uniqueId = storedUser.user.id.toString();
    } else if (localStorage.getItem('guestId')) {
      uniqueId = localStorage.getItem('guestId')!;
    } else {
      this.toastr.warning('No valid user found. Please login or continue as guest.');
      return;
    }

    const orderPayload = {
      uniqueId,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.selectedPayment,
      shippingMethodId: this.selectedShippingMethod?.id || null
    };

    if (this.selectedPayment === 'COD') {
      // Cash on Delivery
      this.loading = true;
      this.orderService.createOrder(orderPayload).subscribe({
        next: (res: any) => {
          this.cartService.resetCartLocally();
          this.router.navigate(['/order-success'], {
            state: {
              orderId: res.orderId,
              orderNumber: res.orderNumber,
              total: res.total,
              createdAt: res.createdAt
            }
          });
        },
        error: (err) => {
          console.error('Order failed:', err);
          this.toastr.error(err.error?.message || 'Failed to place order.');
          this.loading = false;
        },
        complete: () => (this.loading = false)
      });
      return;
    }

    if (this.selectedPayment === 'Stripe') {
      if (!this.card || !this.stripe) return;

      this.loading = true;
      this.cardError = '';
      this.successMessage = '';

      try {
        const orderRes: any = await this.orderService.createOrder(orderPayload).toPromise();
        const orderId = orderRes.orderId;

        const amountInPaise = this.total * 100;
        const res = await this.paymentService
          .createPaymentIntent({
            amount: amountInPaise,
            orderId,
            products: this.cartItems
          })
          .toPromise();

        const clientSecret = res?.clientSecret;

        const result = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name: `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`,
              email: this.shippingAddress.email,
              phone: this.shippingAddress.phone,
              address: {
                line1: this.shippingAddress.address,
                city: this.shippingAddress.city,
                state: this.shippingAddress.state,
                postal_code: this.shippingAddress.postalCode
              }
            }
          }
        });

        if (result.error) {
          this.cardError = result.error.message || 'Payment failed.';
          this.loading = false;
          return;
        }

        if (result.paymentIntent.status === 'succeeded') {
          await this.paymentService.updatePaymentStatus(result.paymentIntent.id).toPromise();

          this.successMessage = 'Payment successful!';
          this.cartService.resetCartLocally();
          this.router.navigate(['/order-success'], {
            state: {
              orderId: orderRes.orderId,
              orderNumber: orderRes.orderNumber,
              total: orderRes.total,
              createdAt: orderRes.createdAt
            }
          });
        }
      } catch (error) {
        console.error('Stripe Error:', error);
        this.cardError = 'An unexpected error occurred.';
        this.loading = false;
      }
    }

  }

  // loadPayPalScript(): Promise<void> {
  //   return new Promise((resolve) => {
  //     if ((<any>window).paypal) {
  //       resolve();
  //       return;
  //     }
  //     const script = document.createElement('script');
  //     script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=${environment.paypalCurrency}`;
  //     script.onload = () => resolve();
  //     document.body.appendChild(script);
  //   });
  // }
  // setupPayPal(): void {
  //   if (this.paypalRendered) return;

  //   const container = document.getElementById('paypal-button-container');
  //   if (!container) return;

  //   this.paypalRendered = true;
  //   const paypal = (<any>window).paypal;
  //   const INR_TO_USD = 0.012;

  //   paypal.Buttons({
  //     createOrder: async (data: any, actions: any) => {
  //       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  //       const uniqueId = storedUser?.user?.id || localStorage.getItem('guestId') || null;

  //       if (!uniqueId) {
  //         this.toastr.warning('No valid user found.');
  //         return;
  //       }

  //       const orderPayload = {
  //         uniqueId,
  //         shippingAddress: this.shippingAddress,
  //         billingAddress: this.billingAddress,
  //         paymentMethod: 'PayPal',
  //         amount: this.total,
  //         shippingMethodId: this.selectedShippingMethod?.id || null
  //       };

  //       const orderRes: any = await this.orderService.createOrder(orderPayload).toPromise();

  //       const payPalRes: any = await this.paypalService.createPaypalOrder(this.total, orderRes.orderId).toPromise();

  //       return payPalRes.orderID;
  //     },

  //     onApprove: async (data: any, actions: any) => {
  //       const captureRes: any = await this.paypalService.captureOrder(data.orderID).toPromise();

  //       this.successMessage = 'PayPal payment successful!';
  //       this.router.navigate(['/order-success'], {
  //         state: {
  //           orderId: captureRes.orderId,
  //           orderNumber: captureRes.orderNumber,
  //           total: captureRes.total,
  //           createdAt: captureRes.createdAt,
  //           promoCode: captureRes.promoCode
  //         }
  //       });
  //     },

  //     onError: (err: any) => {
  //       console.error('PayPal Error:', err);
  //       this.cardError = 'PayPal payment failed.';
  //     }
  //   }).render('#paypal-button-container');
  // }



  loadPayPalScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((<any>window).paypal) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=${environment.paypalCurrency}`;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  setupPayPal(): void {
    if (this.paypalRendered) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    this.paypalRendered = true;
    const paypal = (<any>window).paypal;

    paypal.Buttons({
      createOrder: async (data: any, actions: any) => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const uniqueId = storedUser?.user?.id || localStorage.getItem('guestId') || null;

        if (!uniqueId) {
          this.toastr.warning('No valid user found.');
          return;
        }

        const orderPayload = {
          uniqueId,
          shippingAddress: this.shippingAddress,
          billingAddress: this.billingAddress,
          paymentMethod: 'PayPal',
          amount: this.total,
          shippingMethodId: this.selectedShippingMethod?.id || null
        };

        const orderRes: any = await this.orderService.createOrder(orderPayload).toPromise();

        const payPalRes: any = await this.paypalService.createPaypalOrder(this.total, orderRes.orderId).toPromise();

        (window as any)._localOrderId = orderRes.orderId;

        return payPalRes.orderID;
      },

      onApprove: async (data: any, actions: any) => {
        const localOrderId = (window as any)._localOrderId;

        const captureRes: any = await this.paypalService.captureOrder(localOrderId).toPromise();

        this.successMessage = 'PayPal payment successful!';

        this.router.navigate(['/order-success'], {
          state: {
            orderId: captureRes.orderId,
            orderNumber: captureRes.orderNumber,
            total: captureRes.total,
            createdAt: captureRes.createdAt,
            promoCode: captureRes.promoCode
          }
        });
      },

      onError: (err: any) => {
        console.error('PayPal Error:', err);
        this.cardError = 'PayPal payment failed.';
      }
    }).render('#paypal-button-container');
  }

  copyShippingToBilling() {
    if (this.sameAsShipping) {
      this.billingAddress = { ...this.shippingAddress };
    }
  }

  onPaymentChange() {
    this.cardError = '';
    this.successMessage = '';

    if (this.selectedPayment === 'Stripe') {
      this.setupStripe();
    }
    if (this.selectedPayment === 'Paypal') {
      this.paypalRendered = false;
      this.setupPayPal(); // ensure PayPal renders again

    }
  }


  onShippingMethodSelected(method: any) {
    this.selectedShippingMethod = method;
    const shippingPrice = method?.price || 0;
    this.total = this.subtotal - this.discount + shippingPrice;
  }


}

