import { Component, OnInit } from '@angular/core';
import { OrderService, OrderSummary } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-my-orders',
  imports: [CommonModule,RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: OrderSummary[] = [];
  loading = false;
  error = '';

  constructor(private orderService: OrderService) {}

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
}
