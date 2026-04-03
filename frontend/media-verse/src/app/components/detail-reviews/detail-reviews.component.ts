import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import { ReviewsService } from '../../services/reviews.service';
import { DetailReview } from '../../models/detailreview';
import { DatePipe, NgClass } from '@angular/common';
import { WriteReviewComponent } from '../write-review/write-review.component';
import { UserReview } from '../../models/userreview';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DetailReviewsResponse } from '../../models/detailreviewsresponse';
import { shouldHandleError } from '../../utils/error-handler';
import { NotificationService } from '../../services/notification.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

//TODO: gombok meretenek kezelese

@Component({
  selector: 'app-detail-reviews',
  imports: [
    DatePipe,
    WriteReviewComponent,
    ButtonModule,
    SafeHtmlPipe,
    NgClass,
    Rating,
    FormsModule,
    PaginatorModule,
  ],
  templateUrl: './detail-reviews.component.html',
  styleUrl: './detail-reviews.component.scss',
})
export class DetailReviewsComponent implements OnInit, OnChanges {
  private destroyRef = inject(DestroyRef);
  contentId = input.required<number>();
  contentType = input.required<string>();
  first: number = 0;
  rows: number = 20;

  currentReviews = signal<DetailReview[]>([]);
  totalReviewNumber = signal<number>(0);
  ownReview = signal<UserReview | null>(null);

  isLoggedIn = input.required<boolean>();
  writeReviewVisible = signal<boolean>(false);
  isReviewOpen: boolean = false;

  constructor(
    private reviewsService: ReviewsService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.getReviews();
  }

  ngOnChanges() {
    this.isReviewOpen = JSON.parse(
      localStorage.getItem('content-detail-reviews-open') ?? 'false',
    );
  }

  getReviews() {
    const page = Math.floor(this.first / this.rows) + 1;

    this.reviewsService
      .getReviewsByContent(
        this.contentId(),
        this.contentType(),
        page,
        this.rows,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reviews: DetailReviewsResponse) => {
          this.currentReviews.set(reviews.items);
          this.totalReviewNumber.set(reviews.total);
          this.ownReview.set(reviews.userReview ?? null);
        },
        error: (err) => {
          if (!shouldHandleError(err)) return;
          this.notificationService.error(
            err.error?.error ?? 'Failed to load reviews',
          );
        },
      });
  }

  upsertReview(review: UserReview) {
    this.reviewsService
      .upsertReview(
        this.contentId(),
        this.contentType(),
        review.score,
        review.review,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res.message.includes('unchanged')) {
            this.notificationService.info(res.message ?? 'No changes');
          } else {
            this.notificationService.success(
              res.message ?? 'Saved successfully',
            );
          }

          this.getReviews();
        },
        error: (err) => {
          if (!shouldHandleError(err)) return;
          this.notificationService.error(
            err.error?.error ?? 'Failed to save review',
          );
        },
      });
  }

  deleteReview() {
    this.reviewsService
      .deleteReview(this.contentId(), this.contentType())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.notificationService.success(
            res.message ?? 'Review deleted successfully',
          );
          this.getReviews();
        },
        error: (err) => {
          if (!shouldHandleError(err)) return;
          this.notificationService.error(
            err.error?.error ?? 'Failed to delete review',
          );
        },
      });
  }

  showReviewDialog() {
    this.writeReviewVisible.set(true);
  }

  toggleReviews() {
    this.isReviewOpen = !this.isReviewOpen;
    localStorage.setItem(
      'content-detail-reviews-open',
      this.isReviewOpen.toString(),
    );
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 20;

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.getReviews();
  }
}
