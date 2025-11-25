import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { Movie } from '../../models/movie';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, ToggleSwitchModule, FormsModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  popularMovies$: Movie[] = [];
  movieService = inject(MovieService);
  checked: boolean = false;
  themeService = inject(ThemeService);

  ngOnInit() {
    this.movieService.getPopularMovies().subscribe((data) => {
      this.popularMovies$ = data.results.map((movie) => ({
        ...movie,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
      }));
    });
  }

  changeTheme() {
    this.themeService.toggleTheme();
  }

  toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('my-app-dark');
  }
}
