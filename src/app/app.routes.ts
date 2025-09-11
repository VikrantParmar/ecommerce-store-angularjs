import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layouts/user/user-layout/user-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ShippingMethodComponent } from './components/shipping-method/shipping-method.component';


export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'signin', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent), canActivate: [GuestGuard] },
      { path: 'signup', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent), canActivate: [GuestGuard] },
      { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent), canActivate: [GuestGuard] },
      { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), canActivate: [GuestGuard] },
      { path: 'verify-email', loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent), canActivate: [GuestGuard] },
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'shop', loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent), },
      { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent), },
      { path: 'services', loadComponent: () => import('./pages/service/service.component').then(m => m.ServiceComponent), },
      { path: 'blog', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent), },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent), },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent), },
      { path: 'product/:slug', loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent) },
      // { path: 'product/:slug/:sku', loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent) },


      {
        path: 'account',
        loadComponent: () => import('./pages/account/account/account.component').then(m => m.AccountComponent),
        canActivate: [AuthGuard],
        children: [
          { path: 'profile', loadComponent: () => import('./pages/account/profile/profile.component').then(m => m.ProfileComponent) },
          { path: 'my-orders', loadComponent: () => import('./pages/account/my-orders/my-orders.component').then(m => m.MyOrdersComponent) },
          { path: 'my-orders/:orderNumber', loadComponent: () => import('./pages/account/order-details/order-details.component').then(m => m.OrderDetailsComponent) },
          { path: 'wishlist', loadComponent: () => import('./pages/account/wishlist/wishlist.component').then(m => m.WishlistComponent) },
          { path: 'return-order-request/:orderId', loadComponent: () => import('./pages/account/return-order/return-order.component').then(m => m.ReturnOrderComponent), canActivate: [AuthGuard] },
          { path: '', redirectTo: 'my-orders', pathMatch: 'full' }
        ]
      },



      { path: 'order-success', loadComponent: () => import('./pages/order-success-page/order-success-page.component').then(m => m.OrderSuccessPageComponent), canActivate: [AuthGuard] },
      { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [AuthGuard] },
      { path: 'product-rating/:slug', loadComponent: () => import('./pages/product-rating/product-rating.component').then(m => m.ProductRatingComponent), canActivate: [AuthGuard] },
      { path: 'product/:id/reviews', loadComponent: () => import('./pages/all-reviews/all-reviews.component').then(m => m.AllReviewsComponent), canActivate: [AuthGuard] },



    ],
  },


  {
    path: '**',
    component: PageNotFoundComponent
  }
];
