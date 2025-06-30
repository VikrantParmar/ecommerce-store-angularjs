import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from './services/cart.service';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';


@Component({
  imports: [FormsModule, CommonModule, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  // fixed typo from styleUrl to styleUrls
})
export class AppComponent implements OnInit {
  // isLoggedIn = false;
  // username = '';
  // userRole: string | null = null;
  // cartCount = 0; // Track cart count
  // order: any;


  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService, private cartService: CartService,
    private titleService: Title

  ) { }


  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });












    //   this.authService.isLoggedIn$.subscribe((status) => {
    //     this.isLoggedIn = status;
    //     if (status) {
    //       const user = this.authService.getCurrentUser();
    //       this.username = user.user?.username || 'User';
    //       this.userRole = user.role?.toLowerCase() || null;
    //       console.log('AppComponent user role:', this.userRole);
    //       // this.cartService.getCart().subscribe();

    //     } else {
    //       this.username = '';
    //       this.userRole = null;
    //       this.cartCount = 0; // Reset on logout

    //     }
    //   });
    //   this.cartService.cartCount$.subscribe(count => {
    //     this.cartCount = count;
    //   });

    //   // Cart count subscription
    //   this.cartService.cartCount$.subscribe(count => {
    //     this.cartCount = count;
    //   });

    //   // Route change subscription for updating browser tab title
    //   this.router.events.pipe(
    //     filter(event => event instanceof NavigationEnd)
    //   ).subscribe((event: NavigationEnd) => {
    //     const url = event.urlAfterRedirects;

    //     if (url === '/login') {
    //       // Login page - do not change title, or you can set to default
    //       this.titleService.setTitle('Login');
    //       return;
    //     }

    //     let title = 'My Site'; // default

    //     // Map URLs to titles
    //     switch (url) {
    //       case '/home': title = 'FastWear '; break;
    //       case '/login': title = ' '; break;
    //       case '/register': title = 'Register '; break;
    //       case '/profile': title = 'Profile '; break;
    //       case '/admin/categories': title = 'Categories - Admin'; break;
    //       case '/admin/products': title = 'Products - Admin'; break;
    //       case '/admin/order-list': title = 'Orders List - Admin'; break;
    //       case '/admin/promo': title = 'Promo Codes - Admin'; break;
    //       case '/products-list': title = 'Products List'; break;
    //       case '/cart': title = 'Cart'; break;
    //       case '/checkout': title = 'Checkout'; break;
    //       case '/order-success': title = 'Order Success'; break;
    //       case '/my-orders': title = 'My Orders'; break;
    //       case '/prime': title = 'Fastwear prime'; break;
    //       // Handle dynamic param route, example '/my-orders/:orderId'
    //       default:
    //         // Check for dynamic route like /my-orders/123
    //         if (url.startsWith('/my-orders/')) {
    //           title = 'Order Details';
    //         } else if (url.startsWith('/my-orders')) {
    //           title = 'My Orders';
    //         } else if (url.startsWith('/paypal')) {
    //           title = 'Paypal Payment';
    //         }
    //         break;
    //     }

    //     this.titleService.setTitle(title);
    //   });
  }


}
