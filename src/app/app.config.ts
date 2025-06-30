import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';


// Import animations and toastr providers
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),              // Add this for Angular animations
    provideToastr({                   // Add this for ngx-toastr config
      positionClass: 'toast-top-right',
      timeOut: 2000,
      preventDuplicates: true,
      // aap aur bhi options yahan de sakte hain agar chahiye ho
    }),
  ]
};
