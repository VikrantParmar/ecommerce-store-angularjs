import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { formatPrice } from '../../constants/currency.constant';
import { ProductService } from '../../services/products.service';
@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

  format = formatPrice;

  order: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId) {
      this.error = "Invalid order ID.";
      return;
    }

    this.loading = true;
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || "Failed to load order details";
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
      case 'cancelled':
        return 'bg-danger';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'paid':
        return 'bg-success';
      case 'refunded':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }

}
