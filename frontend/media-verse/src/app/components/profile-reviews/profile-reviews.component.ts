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
import { DatePipe } from '@angular/common';
import { WriteReviewComponent } from '../write-review/write-review.component';
import { UserReview } from '../../models/userreview';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';

import { shouldHandleError } from '../../utils/error-handler';
import { NotificationService } from '../../services/notification.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Rating } from 'primeng/rating';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { ProfileReviewsResponse } from '../../models/profilereviewsresponse';
import { InputText } from 'primeng/inputtext';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  Observable,
  switchMap,
} from 'rxjs';
import { ProfileReview } from '../../models/profilereview';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-profile-reviews',
  imports: [
    DatePipe,
    WriteReviewComponent,
    ButtonModule,
    SafeHtmlPipe,
    Rating,
    FormsModule,
    PaginatorModule,
    SkeletonDetailsComponent,
    InputText,
    ReactiveFormsModule,
    CapitalizePipe,
  ],
  templateUrl: './profile-reviews.component.html',
  styleUrl: './profile-reviews.component.scss',
})
export class ProfileReviewsComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  buttonSize = input.required<'small' | 'large' | undefined>();
  isLoading: boolean = false;
  isSearchLoading: boolean = false;
  private destroyRef = inject(DestroyRef);
  first: number = 0;
  rows: number = 10;

  currentReviews = signal<ProfileReview[]>([]);
  totalReviewNumber = signal<number>(0);
  currentReview = signal<UserReview | null>(null);
  currentTitle = signal<string>('');
  currentId = signal<number>(0);
  currentContentType = signal<string>('');

  writeReviewVisible = signal<boolean>(false);

  searchControl = new FormControl('');

  saveSuccessSignal = signal<boolean>(false);

  constructor(
    private reviewsService: ReviewsService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe(`(max-width: 1024px)`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.rows = result.matches ? 5 : 10;
        this.first = 0;
        this.getReviews(this.searchControl.value ?? '').subscribe({
          next: this.handleSuccess.bind(this),
          error: this.handleError.bind(this),
        });
      });
    this.getReviews()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: this.handleSuccess.bind(this),
        error: this.handleError.bind(this),
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isSearchLoading = true;
          const page = Math.floor(this.first / this.rows) + 1;
          return this.reviewsService.getUserReviews(
            page,
            this.rows,
            query ?? '',
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSearchLoading = false)),
      )
      .subscribe({
        next: this.handleSuccess.bind(this),
        error: this.handleError.bind(this),
      });
  }

  handleSuccess(reviews: ProfileReviewsResponse) {
    this.currentReviews.set(reviews.items);
    this.totalReviewNumber.set(reviews.total);
    this.isLoading = false;
    this.isSearchLoading = false;
    this.searchControl.enable({ emitEvent: false });
  }

  handleError(err: any) {
    if (!shouldHandleError(err)) return;
    this.notificationService.error(
      err.error?.error ?? 'Failed to load reviews',
    );
    this.isLoading = false;
    this.isSearchLoading = false;
    this.searchControl.enable({ emitEvent: false });
  }

  getReviews(searchTerm: string = ''): Observable<ProfileReviewsResponse> {
    this.isLoading = true;
    this.searchControl.disable({ emitEvent: false });
    const page = Math.floor(this.first / this.rows) + 1;

    return this.reviewsService.getUserReviews(page, this.rows, searchTerm);
  }

  upsertReview(review: UserReview) {
    this.saveSuccessSignal.set(false);
    this.reviewsService
      .upsertReview(
        this.currentId(),
        this.currentContentType(),
        review.score,
        review.review,
      )
      .pipe(
        switchMap((res: any) => {
          if (res.message.includes('unchanged')) {
            this.notificationService.info(res.message ?? 'No changes');
          } else {
            this.notificationService.success(
              res.message ?? 'Review saved successfully',
            );
          }
          this.saveSuccessSignal.set(true);
          return this.getReviews(this.searchControl.value ?? '');
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: this.handleSuccess.bind(this),
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
      .deleteReview(this.currentId(), this.currentContentType())
      .pipe(
        switchMap((res: any) => {
          this.notificationService.success(
            res.message ?? 'Review deleted successfully',
          );
          return this.getReviews(this.searchControl.value ?? '');
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: this.handleSuccess.bind(this),
        error: (err) => {
          if (!shouldHandleError(err)) return;
          this.notificationService.error(
            err.error?.error ?? 'Failed to delete review',
          );
        },
      });
  }

  showReviewDialog(selectedReview: ProfileReview) {
    this.currentReview.set({
      review: selectedReview.review,
      score: selectedReview.score,
    });
    this.currentTitle.set(selectedReview.content_title);
    this.currentId.set(selectedReview.content_id);
    this.currentContentType.set(selectedReview.content_type);
    this.writeReviewVisible.set(true);
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 20;

    this.getReviews(this.searchControl.value ?? '').subscribe({
      next: this.handleSuccess.bind(this),
      error: this.handleError.bind(this),
    });
  }
}
