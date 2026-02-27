import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Button } from 'primeng/button';
import { SeriesProgress } from '../../models/seriesprogress';
import { SeriesProgressService } from '../../services/series-progress.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeasonDetails } from '../../models/seasondetails';
import { NotificationService } from '../../services/notification.service';
import { shouldHandleError } from '../../utils/error-handler';
import { SeriesStatus } from '../../utils/series-status.type';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-plus-episode-button',
  imports: [Button],
  templateUrl: './plus-episode-button.component.html',
  styleUrl: './plus-episode-button.component.scss',
})
export class PlusEpisodeButtonComponent {
  private destroyRef = inject(DestroyRef);
  series = input.required<SeriesProgress>();
  isLargeScreen = signal<boolean>(window.innerWidth > 1024);
  isSmallScreen = signal<boolean>(window.innerWidth < 501);
  isLoading = false;
  saved = output<{
    id: number;
    status: SeriesStatus;
    current_season: number;
    current_episode: number;
    last_watched: string;
  }>();

  constructor(
    private seriesProgressService: SeriesProgressService,
    private notificationService: NotificationService,
  ) {
    this.setupResizeListener();
  }

  plusEpisode() {
    this.isLoading = true;
    const series = this.series();

    if (!series.seasons || series.seasons.length === 0) {
      this.notificationService.error('There are no seasons.');
      this.isLoading = false;
      return;
    }

    if (series.status === 'plan_to_watch') {
      const firstRegularSeason = series.seasons
        .filter((s) => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number)[0];

      if (!firstRegularSeason) {
        this.notificationService.error('No regular seasons found.');
        this.isLoading = false;
        return;
      }

      this.updateData(
        series.id,
        'watching',
        firstRegularSeason.season_number,
        1,
      );

      return;
    }

    let newSeason = series.current_season;
    let newEpisode = series.current_episode + 1;
    let status: SeriesStatus = series.status;

    const regularSeasons = series.seasons.filter((s) => s.season_number > 0);
    const maxRegularSeason = Math.max(
      ...regularSeasons.map((s) => s.season_number),
    );
    status = 'watching';

    if (newSeason === 0) {
      const currentSeason = series.seasons.find((s) => s.season_number === 0);

      if (!currentSeason) {
        this.notificationService.error('Specials season not found');
        this.isLoading = false;
        return;
      }

      if (newEpisode > currentSeason.episode_count) {
        newEpisode = currentSeason.episode_count;
        this.notificationService.info(
          'Specials completed! Use the edit dialog to track regular seasons.',
        );
        this.isLoading = false;
        return;
      }
    } else {
      const currentSeason = regularSeasons.find(
        (s) => s.season_number === newSeason,
      );

      if (!currentSeason) {
        this.notificationService.error('Season not found');
        this.isLoading = false;
        return;
      }

      if (newEpisode > currentSeason.episode_count) {
        const nextSeason = regularSeasons.find(
          (s) => s.season_number === newSeason + 1,
        );

        if (!nextSeason) {
          this.notificationService.info(
            'Regular seasons completed! Use the edit dialog to track Specials.',
          );
          this.isLoading = false;
          return;
        }

        newSeason = nextSeason.season_number;
        newEpisode = 1;
      } else {
        const isLastRegularSeason = newSeason === maxRegularSeason;
        const isLastEpisode = newEpisode === currentSeason.episode_count;

        if (isLastRegularSeason && isLastEpisode) {
          status = 'completed';
        }
      }
    }
    this.updateData(this.series().id, status, newSeason, newEpisode);
  }

  updateData(
    seriesId: number,
    status: SeriesStatus,
    newSeason: number,
    newEpisode: number,
  ) {
    this.seriesProgressService
      .setSeriesProgress(seriesId, status, newSeason, newEpisode)
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
              id: seriesId,
              status: res.progress.status,
              current_season: res.progress.current_season,
              current_episode: res.progress.current_episode,
              last_watched: res.progress.last_watched,
            });
          }

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

  get buttonSize() {
    if (this.isLargeScreen()) return 'large';
    return this.isSmallScreen() ? 'small' : undefined;
  }

  private setupResizeListener() {
    const handleResize = () => {
      this.isLargeScreen.set(window.innerWidth > 1024);
      this.isSmallScreen.set(window.innerWidth < 501);
    };

    window.addEventListener('resize', handleResize);

    effect(() => {
      return () => window.removeEventListener('resize', handleResize);
    });
  }
}
