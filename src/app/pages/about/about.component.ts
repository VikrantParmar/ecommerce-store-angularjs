import { Component, AfterViewInit } from '@angular/core';

declare var tns: any;

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit {
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

}
