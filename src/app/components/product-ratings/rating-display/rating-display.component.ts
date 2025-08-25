import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true, // Angular 15+ me standalone banana zaruri hai agar imports use kar rahe ho
  imports: [CommonModule],
  templateUrl: './rating-display.component.html',
  styleUrls: ['./rating-display.component.css']
})
export class RatingDisplayComponent {

  @Input() product!: any;
  public Math = Math;

  get safeAvgRating(): string {
  const rating = Number(this.product?.avgRating);
  if (isNaN(rating)) return '0.0';
  return rating.toFixed(1); // ek decimal point hamesha show karega
}


  get safeTotalRatings(): number {
    return this.product?.totalRatings || 0;
  }
}
