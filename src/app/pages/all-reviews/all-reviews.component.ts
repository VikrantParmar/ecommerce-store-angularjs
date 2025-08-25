import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-all-reviews',
  imports: [CommonModule],
  templateUrl: './all-reviews.component.html',
  styleUrls: ['./all-reviews.component.css'],
})
export class AllReviewsComponent implements OnInit {
  @Input() productId?: number;
  @Input() productSlug?: string;

  ratings: any[] = [];
  ratingData: any = null;
  productNotFound: boolean = false;
  public Math = Math;

  constructor(
    private ratingService: RatingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // If productId not passed as @Input, get it from route params
    if (!this.productId) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id'); // Or 'slug' if using slug in URL
        if (id) {
          this.productId = +id; // convert to number
          this.loadRatings();
        } else {
          this.productNotFound = true;
        }
      });
    } else {
      this.loadRatings();
    }
  }

  loadRatings() {
    if (!this.productId) return;

    this.ratingService.getProductRatings(this.productId).subscribe({
      next: (res) => {
        this.ratings = res.ratings;
        this.ratingData = {
          average: res.average,
          total: res.total,
          starCounts: res.starCounts,
          starPercentages: res.starPercentages,
        };
      },
      error: (err) => {
        console.error('Error fetching ratings', err);
        if (err.status === 404) {
          this.productNotFound = true;
        }
      },
    });
  }
}
