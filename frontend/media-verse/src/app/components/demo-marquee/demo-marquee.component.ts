import {
  afterNextRender,
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { ContentService } from '../../services/content.service';
import { AsyncPipe } from '@angular/common';
import { combineLatest, firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-demo-marquee',
  imports: [AsyncPipe],
  templateUrl: './demo-marquee.component.html',
  styleUrl: './demo-marquee.component.scss',
})
export class DemoMarqueeComponent implements OnDestroy {
  contentService = inject(ContentService);
  popularMovies$ = this.contentService.getPopularMovies$();
  popularSeries$ = this.contentService.getPopularSeries$();

  animationReady = signal(false);

  private observer?: IntersectionObserver;
  private el = inject(ElementRef);
  private isVisible = signal(false);
  private dataLoaded = signal(false);

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.isVisible.set(true);
          this.tryStart();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.el.nativeElement);

    combineLatest([this.popularMovies$, this.popularSeries$])
      .pipe(take(1))
      .subscribe(() => {
        this.dataLoaded.set(true);
        this.tryStart();
      });
  }

  private tryStart() {
    if (this.isVisible() && this.dataLoaded()) {
      this.animationReady.set(true);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
