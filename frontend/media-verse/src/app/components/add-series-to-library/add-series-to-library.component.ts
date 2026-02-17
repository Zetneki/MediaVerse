import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { shouldHandleError } from '../../utils/error-handler';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SeriesStatus } from '../../utils/series-status.type';
import { SeriesProgressService } from '../../services/series-progress.service';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SeasonDetails } from '../../models/seasondetails';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-add-series-to-library',
  imports: [
    DialogModule,
    SelectButtonModule,
    FormsModule,
    DatePipe,
    ButtonModule,
    SelectModule,
    InputNumberModule,
    FloatLabelModule,
    ListboxModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './add-series-to-library.component.html',
  styleUrl: './add-series-to-library.component.scss',
})
export class AddSeriesToLibraryComponent {
  private destroyRef = inject(DestroyRef);
  visible = input<boolean>(false);
  seriesId = input.required<number>();
  isLoading = false;
  isSaving = false;
  lastWatched = null;
  seasons: SeasonDetails[] = [];
  selectedSeason: number = 0;
  episodeNumber: number = 0;
  maxEpisode = signal<number>(0);

  visibleChange = output<boolean>();

  selectedMode: SeriesStatus = 'plan_to_watch';

  constructor(
    private seriesProgressService: SeriesProgressService,
    private notificationService: NotificationService,
  ) {
    effect(() => {
      if (this.visible() && this.seriesId()) {
        this.loadProgress();
      }
    });
  }

  seriesModes = [
    {
      label: 'Plan to watch',
      value: 'plan_to_watch',
      icon: 'pi pi-calendar-plus',
    },
    { label: 'Watching', value: 'watching', icon: 'pi pi-eye' },
    { label: 'Completed', value: 'completed', icon: 'pi pi-check-circle' },
  ];

  loadProgress() {
    this.isLoading = true;
    this.seriesProgressService
      .getProgressBySeriesId(this.seriesId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (progress: any) => {
          this.selectedMode = progress?.status ?? 'plan_to_watch';
          this.lastWatched = progress?.last_watched ?? null;

          this.seasons = (progress?.seasons ?? []).sort((a: any, b: any) => {
            if (a.season_number === 0) return 1;
            if (b.season_number === 0) return -1;
            return a.season_number - b.season_number;
          });

          const savedSeason = progress?.current_season ?? 0;
          const firstRealSeason = this.seasons.find((s) => s.season_number > 0);

          if (
            savedSeason === null ||
            (savedSeason === 0 && this.selectedMode === 'plan_to_watch')
          ) {
            this.selectedSeason = firstRealSeason?.season_number ?? 1;
            this.episodeNumber = 0;
          } else {
            this.selectedSeason = savedSeason;
            this.episodeNumber = progress?.current_episode ?? 0;
          }

          const season = this.seasons.find(
            (s) => s.season_number === this.selectedSeason,
          );
          this.maxEpisode.set(season?.episode_count ?? 0);
        },
        error: () => {
          this.selectedMode = 'plan_to_watch';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  onStatusChange(status: SeriesStatus) {
    switch (status) {
      case 'plan_to_watch':
        const firstRealSeason = this.seasons.find((s) => s.season_number > 0);
        this.selectedSeason = firstRealSeason?.season_number ?? 1;
        this.episodeNumber = 0;

        const planSeason = this.seasons.find(
          (s) => s.season_number === this.selectedSeason,
        );
        this.maxEpisode.set(planSeason?.episode_count ?? 0);
        break;

      case 'completed':
        const seasonNumbers = this.seasons.map((s) => s.season_number);
        const maxSeasonNumber = Math.max(...seasonNumbers);
        const maxSeason = this.seasons.find(
          (s) => s.season_number === maxSeasonNumber,
        );

        this.selectedSeason = maxSeasonNumber;
        this.maxEpisode.set(maxSeason?.episode_count ?? 0);
        this.episodeNumber = this.maxEpisode();
        break;
    }
  }

  onSeasonChange(seasonNumber: number) {
    const season = this.seasons.find((s) => s.season_number === seasonNumber);
    this.maxEpisode.set(season?.episode_count ?? 0);
    this.episodeNumber = 0;
    this.selectedMode = 'watching';
  }

  get seasonNumbers(): { label: string; value: number }[] {
    return this.seasons.map((s) => ({
      label: s.season_number === 0 ? 'Specials' : `${s.season_number}`,
      value: s.season_number,
    }));
  }

  onEpisodeChange(value: number | null) {
    if (value === null) {
      this.episodeNumber = 0;
      return;
    }

    const max = this.maxEpisode();
    const seasonNumbers = this.seasons.map((s) => s.season_number);
    const maxSeason = Math.max(...seasonNumbers);

    if (value > max) {
      setTimeout(() => (this.episodeNumber = max), 0);
    }

    const isLastSeason = this.selectedSeason === maxSeason;
    const isLastEpisode = Math.min(value, max) === max;

    if (isLastSeason && isLastEpisode) {
      this.selectedMode = 'completed';
    } else if (value > 0 || this.selectedSeason > 0) {
      this.selectedMode = 'watching';
    } else {
      this.selectedMode = 'plan_to_watch';
    }
  }

  save() {
    this.isSaving = true;

    this.seriesProgressService
      .setSeriesProgress(
        this.seriesId(),
        this.selectedMode,
        this.selectedSeason,
        this.episodeNumber,
      )
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
