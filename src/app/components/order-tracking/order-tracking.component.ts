import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTrackingService } from '../../services/orders.tracking.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css'],
})
export class OrderTrackingTimelineComponent implements OnInit {
  @Input() orderId!: number | string;
  trackingLogs: any[] = [];
  loading = true;
  error: string | null = null;

  steps = ['Order Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  stepLogs: any[] = []; // final mapped logs
  currentStepIndex = 0;
  cancelled = false;

  constructor(private trackingService: OrderTrackingService) {}

  ngOnInit(): void {
    if (!this.orderId) return;

    this.trackingService.getOrderTracking(this.orderId).subscribe({
      next: (res) => {
        this.trackingLogs = res.data || [];

        // Check if cancelled
        const cancelledLog = this.trackingLogs.find(
          log => log.status.toLowerCase() === 'cancelled'
        );
        this.cancelled = !!cancelledLog;

        // Map steps to logs
        this.stepLogs = this.steps.map((step, idx) => {
          const log = this.trackingLogs
            .filter(l => l.status.toLowerCase().includes(step.toLowerCase()))
            .pop();

          // Agar cancel shipped se pehle hua toh shipped/out for delivery/delivered ignore karo
          if (this.cancelled && ['shipped', 'out for delivery', 'delivered'].includes(step.toLowerCase())) {
            return null;
          }

          if (log) this.currentStepIndex = idx;
          return log || { status: step, createdAt: null, location: null };
        }).filter(Boolean);

        // Cancelled ko last me push karo
        if (this.cancelled && cancelledLog) {
          this.stepLogs.push(cancelledLog);
          this.currentStepIndex = this.stepLogs.length - 1;
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load tracking';
        this.loading = false;
      },
    });
  }
}
