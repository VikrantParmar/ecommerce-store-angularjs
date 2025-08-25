import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RatingService } from '../../../services/rating.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-ratings',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-ratings.component.html',
  styleUrls: ['./product-ratings.component.css'],
})
export class ProductRatingComponent implements OnInit, OnChanges {
  @Input() productId!: number;
  @Input() productSlug!: string;   // 👈 slug input bhi le le


  ratings: any[] = [];
  ratingData: any = null;
  public Math = Math;

  constructor(private ratingService: RatingService,  private router: Router) {}

  ngOnInit(): void {
    // wait for productId
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productId'] && this.productId) {
      this.loadRatings();
    }
  }

  loadRatings() {
    this.ratingService.getProductRatings(this.productId).subscribe((res) => {
      this.ratings = res.ratings;
      this.ratingData = {
        average: res.average,
        total: res.total,
        starCounts: res.starCounts,
        starPercentages: res.starPercentages,
      };
    });
  }


    goToRate() {
    if (this.productSlug) {
      this.router.navigate(['/product-rating', this.productSlug]);
    }
  }

}
