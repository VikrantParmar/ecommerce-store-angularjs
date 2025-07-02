import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { formatPrice } from '../../constants/currency.constant';



@Component({
  selector: 'app-order-success-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success-page.component.html',
  styleUrl: './order-success-page.component.css'
})

export class OrderSuccessPageComponent {
  format = formatPrice;



  orderId: string | null = null;
  orderNumber: string | null = null;
  total: number = 0;
  createdAt: string = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state) {
      this.orderId = state['orderId'];
      this.orderNumber = state['orderNumber']
      this.total = state['total'];
      this.createdAt = state['createdAt'];
    }
  }

}
