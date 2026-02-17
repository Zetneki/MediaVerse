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
import { MovieDetails } from '../../models/moviedetails';
import { ContentService } from '../../services/content.service';
import { DatePipe } from '@angular/common';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { DragscrollDirective } from '../../directives/dragscroll.directive';
import { Movie } from '../../models/movie';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SkeletonDetailsComponent } from '../../components/skeleton-details/skeleton-details.component';
import { TrailerComponent } from '../../components/trailer/trailer.component';
import { GalleriaComponent } from '../../components/galleria/galleria.component';
import { AddMovieToLibrary } from '../../components/add-movie-to-library/add-movie-to-library';

@Component({
  selector: 'app-movie-detail',
  imports: [
    DatePipe,
    KnobModule,
    FormsModule,
    DragscrollDirective,
    MovieCardComponent,
    ButtonModule,
    DialogModule,
    SkeletonDetailsComponent,
    TrailerComponent,
    GalleriaComponent,
    AddMovieToLibrary,
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss',
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  @ViewChild('similarList') similarScroll!: ElementRef<HTMLDivElement>;
  route = inject(ActivatedRoute);
  contentService = inject(ContentService);
  movieId!: number;
  movie!: MovieDetails;
  ratingValue!: number;
  similarMovies: Movie[] = [];
  private paramSub!: Subscription;
  isLoading: boolean = false;
  addToLibraryVisible = signal<boolean>(false);

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      this.movieId = Number(params.get('id'));
      this.loadMovie(this.movieId);
    });
  }

  ngOnDestroy(): void {
    this.paramSub.unsubscribe();
  }

  private loadMovie(movieId: number) {
    this.isLoading = true;

    this.contentService.getMovie$(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.ratingValue = Math.round(movie.vote_average * 10) / 10;
        this.similarMovies = movie.similar_movies ?? [];

        if (!this.movie.overview || this.movie.overview.length === 0) {
          this.movie.overview = 'No overview';
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
        this.movie = undefined as any;
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDialog() {
    this.addToLibraryVisible.set(true);
  }
}
