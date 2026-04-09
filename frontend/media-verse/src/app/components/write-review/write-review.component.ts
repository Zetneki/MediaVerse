import { Component, effect, input, output, signal } from '@angular/core';
import { UserReview } from '../../models/userreview';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-write-review',
  imports: [
    DialogModule,
    RatingModule,
    FormsModule,
    EditorModule,
    Button,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './write-review.component.html',
  styleUrl: './write-review.component.scss',
})
export class WriteReviewComponent {
  title = input.required<string>();
  visible = input.required<boolean>();
  ownReview = input.required<UserReview | null>();
  saveSuccess = input<boolean>(false);

  score = signal<number>(0);
  review = signal<string>('');

  visibleChange = output<boolean>();
  saveReview = output<UserReview>();
  deleteReview = output<void>();

  formats = ['bold', 'italic', 'underline', 'blockquote', 'indent', 'header'];

  constructor(private confirmationService: ConfirmationService) {
    effect(() => {
      if (this.saveSuccess()) {
        this.visibleChange.emit(false);
        this.resetValues();
      }
    });
  }

  onDialogShow() {
    this.score.set(this.ownReview()?.score ?? 0);
    this.review.set(this.ownReview()?.review ?? '');
  }

  delete() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this review?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Delete',
      },
      accept: () => {
        this.deleteReview.emit();
        this.visibleChange.emit(false);
        this.resetValues();
      },
    });
  }

  save() {
    this.saveReview.emit({
      score: this.score(),
      review: this.review(),
    });
  }

  close() {
    this.visibleChange.emit(false);
    this.resetValues();
  }

  onDialogVisibilityChange(value: boolean) {
    this.visibleChange.emit(value);
  }

  resetValues() {
    this.score.set(0);
    this.review.set('');
  }
}
