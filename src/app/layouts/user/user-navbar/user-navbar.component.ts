import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { filter } from 'rxjs/operators';

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
  isNavbarOpen = false;


  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.cartService.getCart().subscribe({
      next: () => { },
      error: () => {
        this.cartCount = 0;
      }
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count ?? 0;
    });

    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        const user = this.authService.getCurrentUser();
        this.username = user.user?.username || 'User';
        this.userRole = user.role?.toLowerCase() || null;
      } else {
        this.username = '';
        this.userRole = null;
        this.cartCount = 0;
      }
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeNavbar();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }

  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
    const element = this.navbarCollapse.nativeElement;

    if (this.isNavbarOpen) {
      element.classList.add('show', 'collapsing-in');
      setTimeout(() => element.classList.remove('collapsing-in'), 300); // animate in
    } else {
      element.classList.add('collapsing-out');
      setTimeout(() => {
        element.classList.remove('show', 'collapsing-out');
      }, 300); // animate out
    }
  }

  // Also keep your auto-close logic:
  closeNavbar(): void {
    const element = this.navbarCollapse?.nativeElement;
    if (element?.classList.contains('show')) {
      element.classList.remove('show');
      this.isNavbarOpen = false;
    }
  }
}
