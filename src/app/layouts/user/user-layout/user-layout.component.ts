import { Component } from '@angular/core';
import { UserNavbarComponent } from "../user-navbar/user-navbar.component";
import { RouterOutlet } from '@angular/router';
import { UserFooterComponent } from "../user-footer/user-footer.component";

@Component({
  selector: 'app-user-layout',
  imports: [UserNavbarComponent, RouterOutlet, UserFooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
