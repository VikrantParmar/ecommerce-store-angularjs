import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ShippingMethodService } from '../../services/shipping.method.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipping-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipping-method.component.html',
  styleUrls: ['./shipping-method.component.css']
})
export class ShippingMethodComponent implements OnInit, OnChanges {
  @Input() pincode!: string;   // checkout se aayega
  @Output() methodSelected = new EventEmitter<any>();

  shippingMethods: any[] = [];
  selectedShippingMethod: any = null;

  constructor(private shippingmethodService: ShippingMethodService) {}

  ngOnInit() {
    if (this.pincode) {
      this.loadShippingMethods();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pincode'] && changes['pincode'].currentValue) {
      this.loadShippingMethods();
    }
  }

  loadShippingMethods() {
    console.log("📦 Loading shipping methods for:", this.pincode);
    this.shippingmethodService.getShippingMethods(this.pincode).subscribe({
      next: (res) => {
        console.log("Shipping methods response:", res);
        this.shippingMethods = res.data || [];
        if (this.shippingMethods.length > 0) {
        // 👇 Default first method select
        this.selectedShippingMethod = this.shippingMethods[0];
        this.methodSelected.emit(this.selectedShippingMethod);
      }
      },
      error: (err) => {
        console.error('Error fetching shipping methods:', err);
        this.shippingMethods = [];
      }
    });
  }

  selectShippingMethod(method: any) {
    this.selectedShippingMethod = method;
    this.methodSelected.emit(method);
  }
}
