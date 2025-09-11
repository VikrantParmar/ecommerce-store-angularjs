import { Component, OnInit } from '@angular/core';
import { OrderService, OrderSummary } from '../../../services/orders.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { formatPrice } from '../../../constants/currency.constant';
import { ProductService } from '../../../services/products.service';


@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {

  format = formatPrice;

  orders: OrderSummary[] = [];
  loading = false;
  error = '';
  loadingInvoice: { [orderId: number]: boolean } = {};



  constructor(private orderService: OrderService, private productService: ProductService, private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

    getCartImageUrl(item: any): string {
    if (item.variant?.images?.length > 0) {
      return this.productService.getVariantImageUrl(item.variant.images[0].image_url);
    }
    return this.productService.getImageUrl(item.product?.img);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'order confirmed':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-danger';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'paid':
        return 'bg-success';
      case 'Refunded':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }

  downloadInvoice(orderId: number, orderNumber: string) {
    this.loadingInvoice[orderId] = true;
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (res: Blob) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadingInvoice[orderId] = false;
      },
      error: () => this.loadingInvoice[orderId] = false
    });
  }


goToRating(product: any) {
  if (!product) return;
  this.router.navigate(['/product-rating', product.slug]);
}



}
