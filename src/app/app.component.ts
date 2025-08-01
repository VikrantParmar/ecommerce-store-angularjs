import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { ProductService } from './services/products.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [FormsModule, CommonModule, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private lastRoute = '';
  private scrollPositions = new Map<string, number>();
  private lastProductSlug = ''; // ✅ Add this to track last slug

  constructor(
    private router: Router,
    private titleService: Title,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        // Restore scroll position when going back to /shop
        if (this.lastRoute.startsWith('/product/') && url === '/shop') {
          const scrollY = this.scrollPositions.get('/shop') || 0;
          setTimeout(() => window.scrollTo({ top: scrollY, behavior: 'smooth' }), 0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Title setting
        if (url === '/login') {
          this.titleService.setTitle('signin');
          return;
        }

        let title = 'Furni - Home';

        switch (url) {
          case '/home': title = 'Home'; break;
          case '/shop': title = 'Shop'; break;
          case '/about': title = 'About us'; break;
          case '/services': title = 'Services'; break;
          case '/blog': title = 'Blog'; break;
          case '/contact': title = 'Contact us'; break;
          case '/signin': title = 'Signin'; break;
          case '/signup': title = 'Signup'; break;
          case '/profile': title = 'Profile'; break;
          case '/wishlist': title = 'Wishlist'; break;
          case '/cart': title = 'Cart'; break;
          case '/checkout': title = 'Checkout'; break;
          case '/order-success': title = 'Order Success'; break;
          case '/my-orders': title = 'My Orders'; break;
          case '/prime': title = 'Fastwear Prime'; break;

          default:
            if (url.startsWith('/product/')) {
              const parts = url.split('/product/')[1]?.split('/');
              const slug = decodeURIComponent(parts?.[0] || '');

              if (!slug || this.lastProductSlug === slug) return;

              this.lastProductSlug = slug;

              this.productService.getProductBySlug(slug).subscribe({
                next: (res) => {
                  const productName = res.data?.name || 'Product';
                  this.titleService.setTitle(productName);
                },
                error: () => {
                  this.titleService.setTitle('Product Not Found');
                }
              });
              return;
            } else if (url.startsWith('/my-orders/')) {
              title = 'Order Details';
            } else if (url.startsWith('/paypal')) {
              title = 'Paypal Payment';
            }
            break;
        }

        this.titleService.setTitle(title);
        this.lastRoute = url;

        // Reset slug if we leave product page
        if (!url.startsWith('/product/')) {
          this.lastProductSlug = '';
        }
      });
  }
}
