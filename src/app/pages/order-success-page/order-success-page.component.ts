import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { formatPrice } from '../../constants/currency.constant';
import { OrderService } from '../../services/orders.service';




@Component({
  selector: 'app-order-success-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success-page.component.html',
  styleUrl: './order-success-page.component.css'
})

export class OrderSuccessPageComponent {
  format = formatPrice;
  loadingInvoice = false;




  orderId: string | null = null;
  orderNumber: string | null = null;
  total: number = 0;
  createdAt: string = '';

  constructor(private router: Router, private orderService: OrderService) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state) {
      this.orderId = state['orderId'];
      this.orderNumber = state['orderNumber']
      this.total = state['total'];
      this.createdAt = state['createdAt'];
    }
  }

   downloadInvoice() {
    if (!this.orderId) return;

    this.loadingInvoice = true;

    this.orderService.downloadInvoice(+this.orderId).subscribe({
      next: (res: Blob) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.orderNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadingInvoice = false;
      },
      error: (err) => {
        console.error('Invoice download failed', err);
        this.loadingInvoice = false;
      }
    });
  }

}
