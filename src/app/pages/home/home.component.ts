import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

declare var tns: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,          // <-- Add this
    RouterLink,
    ProductGridComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  loadingProducts = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService
  ) { }

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
    this.loadingProducts = true;
    this.productService.getAllProducts({
      page: 1,
      limit: 4,
      sortField: 'createdAt',
      sortOrder: 'DESC'
    }).subscribe({
      next: (res) => {
        this.products = res.data?.data || [];
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }

  addToCart(productId: number) {
    this.cartService.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => this.toastr.success('Product added to cart'),
      error: () => this.toastr.error('Failed to add product to cart')
    });
  }
}
