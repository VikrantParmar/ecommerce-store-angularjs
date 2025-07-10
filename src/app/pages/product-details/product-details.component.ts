import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ProductUtilsService } from '../../utils/product-utils.service';
import { formatPrice } from '../../constants/currency.constant';
import { RouterLink } from '@angular/router';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  loading = true;
  format = formatPrice;
  quantity: number = 1;



  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public productUtils: ProductUtilsService,
  ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const slug = params.get('slug');
    if (slug) {
      this.loadProduct(slug);
    }
  });
}

loadProduct(slug: string): void {
  this.loading = true;
  this.quantity = 1; // reset quantity
  this.productService.getProductBySlug(slug).subscribe({
    next: (res) => {
      this.product = res.data;
      this.loading = false;
      // Optionally scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    error: () => {
      this.product = null;
      this.loading = false;
      console.error('Product not found');
    }
  });
}


  getImageUrl(filename: string): string {
    return this.productUtils.getImageUrl(filename);
  }

  addToCart(product: any) {
  const payload = {
    ...product,
    quantity: this.quantity,
  };

  this.productUtils.addToCart(payload);
}


  increaseQty() {
  if (this.quantity < this.product.stock) {
    this.quantity++;
  }
}

decreaseQty() {
  if (this.quantity > 1) {
    this.quantity--;
  }
}
}
