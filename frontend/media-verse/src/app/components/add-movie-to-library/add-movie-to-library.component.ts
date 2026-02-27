import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MovieProgressService } from '../../services/movie-progress.service';
import { MovieStatus } from '../../utils/movie-status.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../services/notification.service';
import { shouldHandleError } from '../../utils/error-handler';
import { DatePipe } from '@angular/common';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MovieProgress } from '../../models/movieprogress';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-movie-to-library',
  imports: [
    DialogModule,
    ButtonModule,
    SelectButtonModule,
    FormsModule,
    DatePipe,
    ListboxModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './add-movie-to-library.component.html',
  styleUrl: './add-movie-to-library.component.scss',
})
export class AddMovieToLibraryComponent {
  private destroyRef = inject(DestroyRef);
  visible = input<boolean>(false);
  movieId = input.required<number>();
  existingProgress = input<MovieProgress | null>(null);

  visibleChange = output<boolean>();
  saved = output<{ id: number; status: MovieStatus; last_watched: string }>();
  deleted = output<number>();

  isLoading = false;
  lastWatched: string | null = null;
  selectedMode: MovieStatus = 'plan_to_watch';

  constructor(
    private movieProgressService: MovieProgressService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {
    effect(() => {
      if (this.visible() && this.movieId()) {
        const existing = this.existingProgress();
        if (existing) {
          this.selectedMode = existing.status;
          this.lastWatched = existing.last_watched ?? null;
        } else {
          this.loadProgress();
        }
      }
    });
  }

  movieModes = [
    {
      label: 'Plan to watch',
      value: 'plan_to_watch',
      icon: 'pi pi-calendar-plus',
    },
    { label: 'Completed', value: 'completed', icon: 'pi pi-check-circle' },
  ];

  loadProgress() {
    this.isLoading = true;

    this.movieProgressService
      .getProgressByMovieId(this.movieId())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (progress: MovieProgress) => {
          this.selectedMode = progress?.status ?? 'plan_to_watch';
          this.lastWatched = progress?.last_watched ?? null;
        },
        error: () => {
          this.selectedMode = 'plan_to_watch';
        },
      });
  }

  deleteProgress() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this movie from you library?',
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
        this.isLoading = true;
        this.movieProgressService
          .deleteMovieProgress(this.movieId())
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
              this.isLoading = false;
            }),
          )
          .subscribe({
            next: (res: any) => {
              this.deleted.emit(this.movieId());
              this.close();
              this.notificationService.success(
                res.message ?? 'Progress deleted successfully',
              );
            },
            error: (err) => {
              if (!shouldHandleError(err)) return;
              this.notificationService.error(
                err.error?.error ?? 'Delete failed',
              );
            },
          });
      },
    });
  }

  save() {
    this.isLoading = true;

    this.movieProgressService
      .setMovieProgress(this.movieId(), this.selectedMode)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          if (res.progress) {
            this.saved.emit({
              id: this.movieId(),
              status: res.progress.status,
              last_watched: res.progress.last_watched,
            });
          }
          this.close();
          if (res.message.includes('unchanged')) {
            this.notificationService.info(res.message ?? 'No changes');
          } else {
            this.notificationService.success(
              res.message ?? 'Saved successfully',
            );
          }
        },
        error: (err) => {
          if (!shouldHandleError(err)) return;
          this.notificationService.error(err.error?.error ?? 'Save failed');
        },
      });
  }

  close() {
    this.visibleChange.emit(false);
  }

  onDialogVisibilityChange(value: boolean) {
    this.visibleChange.emit(value);
  }
}
