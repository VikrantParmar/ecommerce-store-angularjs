import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterOutlet, RouterLink, RouterModule  } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-account',
  imports: [RouterOutlet, RouterLink, RouterModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

  cartCount = 0;
  wishlistCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) { }



  logout(): void {
    this.authService.logout();

    this.cartCount = 0;
    this.wishlistCount = 0;
    this.cartService['cartCache'] = null;
    this.toastr.success("Logged Out Successfully")
    this.router.navigate(['/signin']);
  }
}
