import { Component, effect, input } from '@angular/core';
import { MeterGroup } from 'primeng/metergroup';
import { UserStatisticsService } from '../../services/user-statistics.service';
import { Content } from '../../types/content.type';
import { shouldHandleError } from '../../utils/error-handler';
import { NotificationService } from '../../services/notification.service';
import { StatusStat } from '../../models/statusstat';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GenreStats } from '../../models/genresstats';

@Component({
  selector: 'app-content-statistics',
  imports: [MeterGroup, CardModule, ButtonModule],
  templateUrl: './content-statistics.component.html',
  styleUrl: './content-statistics.component.scss',
})
export class ContentStatisticsComponent {
  contentType = input.required<Content>();
  value: any[] = [{ label: '', value: 0 }];
  topGenres: string[] = [];

  constructor(
    private userStatisticsService: UserStatisticsService,
    private notificationService: NotificationService,
  ) {
    effect(() => {
      this.getContentStats(this.contentType());
      this.getGenresStats(this.contentType());
    });
  }

  async getContentStats(contentType: Content) {
    switch (contentType) {
      case 'movie':
        return this.userStatisticsService
          .getMovieStatusStatsByUserId()
          .then((res: StatusStat[]) => {
            const find = (status: string) =>
              +(res.find((r) => r.status === status)?.count ?? 0);
            const total = res.reduce((sum, r) => sum + +r.count, 0);
            const percent = (value: number) =>
              total === 0 ? 0 : Math.round((value / total) * 100);

            this.value = [
              {
                label: 'Plan to watch',
                count: find('plan_to_watch'),
                value: percent(find('plan_to_watch')),
                color: 'var(--p-blue-500)',
                icon: 'pi pi-bookmark',
              },
              {
                label: 'Completed',
                count: find('completed'),
                value: percent(find('completed')),
                color: 'var(--p-green-500)',
                icon: 'pi pi-check-circle',
              },
            ];
          })
          .catch((err) => {
            if (!shouldHandleError(err)) return;
            this.notificationService.error(
              err.error?.error ?? 'Failed to load statistics',
            );
          });
      case 'series':
        return this.userStatisticsService
          .getSeriesStatusStatsByUserId()
          .then((res: StatusStat[]) => {
            const find = (status: string) =>
              +(res.find((r) => r.status === status)?.count ?? 0);
            const total = res.reduce((sum, r) => sum + +r.count, 0);
            const percent = (value: number) =>
              total === 0 ? 0 : Math.round((value / total) * 100);

            this.value = [
              {
                label: 'Plan to watch',
                count: find('plan_to_watch'),
                value: percent(find('plan_to_watch')),
                color: 'var(--p-yellow-500)',
                icon: 'pi pi-bookmark',
              },
              {
                label: 'Watching',
                count: find('watching'),
                value: percent(find('watching')),
                color: 'var(--p-cyan-500)',
                icon: 'pi pi-eye',
              },
              {
                label: 'Completed',
                count: find('completed'),
                value: percent(find('completed')),
                color: 'var(--p-purple-500)',
                icon: 'pi pi-check-circle',
              },
            ];
          })
          .catch((err) => {
            if (!shouldHandleError(err)) return;
            this.notificationService.error(
              err.error?.error ?? 'Failed to load statistics',
            );
          });
    }
  }

  async getGenresStats(contentType: Content) {
    switch (contentType) {
      case 'movie':
        return this.userStatisticsService
          .getMovieTopGenresByUserId()
          .then((res: GenreStats[]) => {
            this.topGenres = res.map((r) => r.genre);
          })
          .catch((err) => {
            if (!shouldHandleError(err)) return;
            this.notificationService.error(
              err.error?.error ?? 'Failed to load statistics',
            );
          });
      case 'series':
        return this.userStatisticsService
          .getSeriesTopGenresByUserId()
          .then((res: GenreStats[]) => {
            this.topGenres = res.map((r) => r.genre);
          })
          .catch((err) => {
            if (!shouldHandleError(err)) return;
            this.notificationService.error(
              err.error?.error ?? 'Failed to load statistics',
            );
          });
    }
  }
}
