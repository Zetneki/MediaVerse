import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { SeriesDetails } from '../../models/seriesdetails';
import { Subscription } from 'rxjs';
import { Series } from '../../models/series';
import { SkeletonDetailsComponent } from '../../components/skeleton-details/skeleton-details.component';
import { Knob } from 'primeng/knob';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { TrailerComponent } from '../../components/trailer/trailer.component';
import { GalleriaComponent } from '../../components/galleria/galleria.component';
import { SeriesCardComponent } from '../../components/series-card/series-card.component';
import { AddMovieToLibraryComponent } from '../../components/add-movie-to-library/add-movie-to-library.component';
import { DragscrollDirective } from '../../directives/dragscroll.directive';
import { AddSeriesToLibraryComponent } from '../../components/add-series-to-library/add-series-to-library.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-series-detail',
  imports: [
    SkeletonDetailsComponent,
    Knob,
    FormsModule,
    DatePipe,
    Button,
    TrailerComponent,
    GalleriaComponent,
    SeriesCardComponent,
    DragscrollDirective,
    AddSeriesToLibraryComponent,
  ],
  templateUrl: './series-detail.component.html',
  styleUrl: './series-detail.component.scss',
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  @ViewChild('similarList') similarScroll!: ElementRef<HTMLDivElement>;
  route = inject(ActivatedRoute);
  contentService = inject(ContentService);
  authService = inject(AuthService);
  seriesId!: number;
  series!: SeriesDetails;
  ratingValue!: number;
  similarSeries: Series[] = [];
  private paramSub!: Subscription;
  isLoading: boolean = false;
  addToLibraryVisible = signal(false);

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      this.seriesId = Number(params.get('id'));
      this.loadSeries(this.seriesId);
    });
  }

  ngOnDestroy(): void {
    this.paramSub.unsubscribe();
  }

  private loadSeries(seriesId: number) {
    this.isLoading = true;

    this.contentService.getSeries$(seriesId).subscribe({
      next: (series) => {
        this.series = series;
        this.ratingValue = Math.round(series.vote_average * 10) / 10;
        this.similarSeries = series.similar_series ?? [];

        if (!this.series.overview || this.series.overview.length === 0) {
          this.series.overview = 'No overview';
        }

        this.isLoading = false;

        requestAnimationFrame(() => {
          if (this.similarScroll) {
            this.similarScroll.nativeElement.scrollLeft = 0;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.series = undefined as any;
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get sortedSeasons() {
    return this.series.seasons.sort((a, b) => {
      if (a.season_number === 0) return 1;
      if (b.season_number === 0) return -1;
      return a.season_number - b.season_number;
    });
  }

  showDialog() {
    this.addToLibraryVisible.set(true);
  }
}
