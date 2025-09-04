import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './user-navbar.component.html',
  styleUrls: ['./user-navbar.component.css']
})
export class UserNavbarComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  userRole: string | null = null;
  cartCount = 0;
  wishlistCount = 0;
  isNavbarOpen = false;

  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count ?? 0;
    });

    this.wishlistService.wishlistCount$.subscribe(count => {
      this.wishlistCount = count ?? 0;
    });

    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;

      if (status) {
        const user = this.authService.getCurrentUser();
        this.username = user.user?.username || 'User';
        this.userRole = user.role?.toLowerCase() || null;

        this.cartService.getCart().subscribe();
        this.wishlistService.getWishlist().subscribe();

      } else {
        this.username = '';
        this.userRole = null;

        this.cartService.getCart().subscribe();
        this.wishlistCount = 0;

      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeNavbar();
    });
  }

  logout(): void {
  this.authService.logout();

  this.cartCount = 0;
  this.wishlistCount = 0;
  this.cartService['cartCache'] = null;

  this.router.navigate(['/signin']);
}



  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
    const element = this.navbarCollapse.nativeElement;

    if (this.isNavbarOpen) {
      element.classList.add('show', 'collapsing-in');
      setTimeout(() => element.classList.remove('collapsing-in'), 300);
    } else {
      element.classList.add('collapsing-out');
      setTimeout(() => {
        element.classList.remove('show', 'collapsing-out');
      }, 300);
    }
  }

  closeNavbar(): void {
    const element = this.navbarCollapse?.nativeElement;
    if (element?.classList.contains('show')) {
      element.classList.remove('show');
      this.isNavbarOpen = false;
    }
  }
}

