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
  ],
  templateUrl: './add-movie-to-library.html',
  styleUrl: './add-movie-to-library.scss',
})
export class AddMovieToLibrary {
  private destroyRef = inject(DestroyRef);
  visible = input<boolean>(false);
  movieId = input.required<number>();
  isLoading = false;
  isSaving = false;
  lastWatched = null;

  visibleChange = output<boolean>();

  selectedMode: MovieStatus = 'plan_to_watch';

  constructor(
    private movieProgressService: MovieProgressService,
    private notificationService: NotificationService,
  ) {
    effect(() => {
      if (this.visible() && this.movieId()) {
        this.loadProgress();
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (progress: any) => {
          this.selectedMode = progress?.status ?? 'plan_to_watch';
          this.lastWatched = progress?.last_watched ?? null;
        },
        error: () => {
          this.selectedMode = 'plan_to_watch';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  save() {
    this.isSaving = true;

    this.movieProgressService
      .setMovieProgress(this.movieId(), this.selectedMode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
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
          this.close();
          if (!shouldHandleError(err)) return;
          this.notificationService.error(err.error?.error ?? 'Save failed');
        },
        complete: () => {
          this.isSaving = false;
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
