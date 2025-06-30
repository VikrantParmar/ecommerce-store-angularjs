import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

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
}
