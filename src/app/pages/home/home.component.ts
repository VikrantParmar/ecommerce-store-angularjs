import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

declare var tns: any;

@Component({
  selector: 'app-home',
  standalone: true,
  // imports: [ProductGridComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  featuredProducts: any[] = []; // ✅ needed for [products]
  loading = false;              // ✅ needed for [loading]

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  ngAfterViewInit(): void {
    tns({
      container: '.testimonial-slider',
      items: 1,
      slideBy: 'page',
      autoplay: true,
      controlsContainer: '#testimonial-nav',
      nav: false,
      autoplayButtonOutput: false
    });
  }

  loadFeaturedProducts() {
    this.loading = true;
    this.productService.getAllProducts({
      page: 1,
      limit: 3,
      sortField: 'createdAt',
      sortOrder: 'DESC'
    }).subscribe({
      next: (res) => {
        this.featuredProducts = res.data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  onAddToCart(productId: number) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => this.toastr.success('Product added to cart'),
      error: () => this.toastr.error('Failed to add product to cart')
    });
  }
}
