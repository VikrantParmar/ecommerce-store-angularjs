import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { OrderService } from '../../../services/orders.service';
import { ToastrService } from 'ngx-toastr';
import { OrderReturnService } from '../../../services/order.return.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-return-order',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './return-order.component.html',
  styleUrls: ['./return-order.component.css']
})
export class ReturnOrderComponent implements OnInit {

  orderId: number = 0;
  order: any = null;
  loading = false;
  error = '';

  returnReasons: string[] = [];
  selectedReason: string = '';
  comment: string = '';
  isSubmitting = false;
  returnSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderReturnService: OrderReturnService,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!this.orderId) {
      this.error = 'Invalid order ID';
      return;
    }

    this.loading = true;

    this.orderService.getOrderDetails(this.orderId).subscribe({
      next: (res) => {
        this.order = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load order details';
        this.loading = false;
      }
    });

    // Hardcoded reasons, ya API se fetch bhi kar sakte ho
    this.returnReasons = ['Damaged Product', 'Wrong Item', 'Not Satisfied', 'Other'];
  }

  submitReturn() {
    if (!this.selectedReason) {
      this.toastr.warning('Please select a reason');
      return;
    }

    this.isSubmitting = true;
    this.orderReturnService.createReturn(this.orderId, this.selectedReason, this.comment)
      .subscribe({
        next: () => {
          this.toastr.success('Return request submitted successfully');
          this.returnSuccess = true;
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to submit return request');
          this.isSubmitting = false;
        }
      });
  }

  cancelReturn() {
    this.router.navigate(['/my-orders', this.orderId]);
  }
}
