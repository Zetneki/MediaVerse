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
  visible = input.required<boolean>();
  ownReview = input.required<UserReview | null>();

  score = signal<number>(0);
  review = signal<string>('');

  visibleChange = output<boolean>();
  saveReview = output<UserReview>();
  deleteReview = output<void>();

  formats = ['bold', 'italic', 'underline', 'list', 'indent', 'size'];

  constructor(private confirmationService: ConfirmationService) {
    effect(() => {
      this.score.set(this.ownReview()?.score ?? 0);
      this.review.set(this.ownReview()?.review ?? '');
    });
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
      },
    });
  }

  save() {
    console.log(this.score(), this.review());
    this.saveReview.emit({
      score: this.score(),
      review: this.review(),
    });
    this.visibleChange.emit(false);
  }

  close() {
    this.visibleChange.emit(false);
  }

  onDialogVisibilityChange(value: boolean) {
    this.visibleChange.emit(value);
  }
}
