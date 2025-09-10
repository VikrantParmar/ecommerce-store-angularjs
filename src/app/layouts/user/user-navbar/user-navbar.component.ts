import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule],
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
  searchQuery: string = '';
  categories: any[] = [];
  



  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService

  ) { }

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count ?? 0;
    });

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';

      this.categoryService.getCategories({ page: 1, limit: 100, onlyWithProducts: true }).subscribe(res => {
        this.categories = res.data?.data || [];
      });

    });

    // this.wishlistService.wishlistCount$.subscribe(count => {
    //   this.wishlistCount = count ?? 0;
    // });

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

  onSearchSubmit() {
    if (!this.searchQuery) return;

    let words = this.searchQuery.trim().split(/\s+/).slice(0, 3);
    this.searchQuery = words.join(" ");

    this.router.navigate(['/shop'], {
      queryParams: { search: this.searchQuery, page: 1, limit: 12, sort: "default" }
    });
  }

  onCategorySelect(categoryName: string) {
    this.searchQuery = '';
    this.router.navigate(['/shop'], {
      queryParams: { category: categoryName, page: 1, limit: 12, sort: "default" }
    });
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

