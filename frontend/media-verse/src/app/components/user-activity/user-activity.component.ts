import { Component, effect, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { UserActivity } from '../../models/useractivity';
import { shouldHandleError } from '../../utils/error-handler';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-activity',
  imports: [ChartModule],
  templateUrl: './user-activity.component.html',
  styleUrl: './user-activity.component.scss',
})
export class UserActivityComponent {
  activityData: UserActivity[] = [];
  chartData!: any;
  chartOptions!: any;
  indexAxis: string = 'x';
  isSmallScreen = signal<boolean>(window.innerWidth < 500);

  constructor(
    private themeService: ThemeService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.userService
      .getActivity()
      .then((data) => {
        this.activityData = this.fillMissingDays(data);
        this.initChart();
      })
      .catch((err) => {
        if (!shouldHandleError(err)) return;
        this.notificationService.error(
          err.error?.error ?? 'Failed to load activity data',
        );
      });

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    effect(() => {
      this.themeService.activeThemeSignal();
      this.themeService.activeModeSignal();

      setTimeout(() => this.initChart(), 50);
    });
  }

  initChart() {
    if (!this.activityData.length) return;

    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--app-primary-color').trim();
    const text = style.getPropertyValue('--app-text-color').trim();
    const border = style.getPropertyValue('--border-color').trim();

    this.chartData = {
      labels: this.activityData.map((d) =>
        new Date(d.activity_date + 'T00:00:00').toLocaleDateString('en', {
          month: 'short',
          day: 'numeric',
        }),
      ),
      datasets: [
        {
          label: 'Daily activity',
          data: this.activityData.map((d) => d.activity_count),
          backgroundColor: this.hexToRgba(primary, 0.5),
          opacity: 0.5,
          borderColor: this.hexToRgba(primary, 0.8),
          borderWidth: 1,
        },
      ],
    };

    this.chartOptions = {
      indexAxis: this.isSmallScreen() ? 'y' : 'x',
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: text },
          grid: { color: border },
          title: this.isSmallScreen()
            ? undefined
            : {
                display: true,
                text: 'Activity count',
                color: text,
              },
        },
        x: {
          ticks: { color: text },
          grid: { color: border },
          title: this.isSmallScreen()
            ? {
                display: true,
                text: 'Activity count',
                color: text,
              }
            : undefined,
        },
      },
      plugins: {
        legend: {
          labels: { color: text },
        },
      },
    };
  }

  hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  handleResize = () => {
    this.isSmallScreen.set(window.innerWidth < 500);
    this.initChart();
  };

  fillMissingDays(data: UserActivity[]) {
    const result: UserActivity[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');

      const existing = data.find(
        (d) =>
          new Date(d.activity_date).toLocaleDateString('en-CA') === dateStr,
      );

      result.push({
        activity_date: dateStr,
        activity_count: existing?.activity_count ?? 0,
      });
    }
    return result;
  }
}
