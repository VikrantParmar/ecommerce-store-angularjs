import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/orders.service';
import { formatPrice } from '../../../constants/currency.constant';
import { ProductService } from '../../../services/products.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { OrderTrackingTimelineComponent } from '../../../components/order-tracking/order-tracking.component';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, OrderTrackingTimelineComponent, RouterLink, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

  format = formatPrice;

  order: any = null;
  loading = false;
  error = '';

  cancelReasons: string[] = [];
  selectedReason: string = '';
  comment: string = '';

  showCancelForm = false;
  showAllReasons = false;
  cancelSuccess = false;
  isSubmitting = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService,
    private toastr: ToastrService
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
      case 'pending': return 'bg-warning text-dark';
      case 'order confirmed': return 'bg-success text-white';
      case 'cancelled': return 'bg-danger';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'paid': return 'bg-success';
      case 'refunded': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  }

  openCancelConfirm(order: any) {
    const modal = document.getElementById('cancelConfirmModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  proceedToCancelPage(order: any) {
    const modal = document.getElementById('cancelConfirmModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }

    this.orderService.getCancellationReasons().subscribe({
      next: (res: any) => {
        this.cancelReasons = res.reasons || [];
        this.showCancelForm = true;
        this.selectedReason = '';
        this.comment = '';
        this.showAllReasons = true;
      },
      error: (err) => {
        console.error("Failed to load cancel reasons", err);
        this.toastr.error("Failed to load reasons");
      }
    });
  }

  submitCancel(orderId: number | string) {
    const id = Number(orderId);

    if (!this.selectedReason) {
      this.toastr.warning("Please select a reason");
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.orderService.cancelOrder(id, this.selectedReason, this.comment).subscribe({
        next: () => {
          this.order.status = 'Cancelled';
          this.cancelSuccess = true;
          this.toastr.success("Order cancelled successfully");
          this.showCancelForm = true;
          this.showAllReasons = false;
          this.isSubmitting = false;
        },
        error: () => {
          this.toastr.error("Failed to cancel order");
          this.isSubmitting = false;
        }
      });
    }, 2000);
  }

  openReturnPage(order: any) {
  this.router.navigate(['/account/return-order-request', order.id]);
}


}
