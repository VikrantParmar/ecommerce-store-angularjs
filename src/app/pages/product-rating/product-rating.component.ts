import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../services/rating.service';
import { ProductService } from '../../services/products.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-rating.component.html',
  styleUrls: ['./product-rating.component.css']
})
export class ProductRatingComponent implements OnInit, OnDestroy {

  product: any = null;
  selectedRating: number = 0;
  feedback: string = '';
  submitted: boolean = false;
  loading: boolean = true;
  alreadyRated = false;
  countdown = 3;
  countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private ratingService: RatingService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) this.loadProduct(slug);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  loadProduct(slug: string) {
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  setRating(star: number) {
    if (this.alreadyRated) return;
    this.selectedRating = star;
  }

submitFeedback() {
  if (!this.selectedRating) {
    this.toastr.warning('Please select a star rating!');
    return;
  }

  const payload = {
    productId: this.product.id,
    rating: this.selectedRating,
    review: this.feedback
  };

  this.ratingService.createRating(payload).subscribe({
    next: () => this.showThankYou(),
    error: (err: any) => {
      // Specific backend checks
      if (err.status === 400) {
        if (err.error?.message === "You already rated this product") {
          this.showAlreadyRated();
        } else if (err.error?.message === "You can only rate products after delivery.") {
          this.toastr.warning('You can only rate this product after delivery.');
        } else {
          this.toastr.error(err.error?.message || 'Error submitting rating!');
        }
      } else if (err.status === 401) {
        this.toastr.error('Please login to submit a rating!');
      } else {
        this.toastr.error('Error submitting rating!');
      }
    }
  });
}


  showThankYou() {
    this.submitted = true;
    this.alreadyRated = true; // hide form & stars
    this.toastr.success('Thank you! Your feedback has been submitted.');
    this.startCountdown();
  }

  showAlreadyRated() {
    this.alreadyRated = true;
    this.submitted = false;
    this.selectedRating = 0;
    this.toastr.warning('You have already reviewed this product.');
    this.startCountdown();
  }

  startCountdown() {
    this.countdown = 3;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate([`/product/${this.product.slug}`]);
      }
    }, 1000);
  }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }
}
