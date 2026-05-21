import { Component, input, output } from '@angular/core';
import { Genre } from '../../models/genre';
import { SortByOption } from '../../models/sortbyoption';
import { SelectModule } from 'primeng/select';
import { Button } from 'primeng/button';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  imports: [SelectModule, Button, NgClass, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  genres = input<Genre[]>([]);
  type = input<string>('');

  sortOptions: SortByOption[] = [
    { label: 'Popularity Descending', value: 'popularity.desc' },
    { label: 'Popularity Ascending', value: 'popularity.asc' },
    { label: 'Rating Descending', value: 'vote_average.desc' },
    { label: 'Rating Ascending', value: 'vote_average.asc' },
    {
      label: 'Release Date Descending',
      value:
        this.type() === 'movies'
          ? 'primary_release_date.desc'
          : 'first_air_date.desc',
    },
    {
      label: 'Release Date Ascending',
      value:
        this.type() === 'movies'
          ? 'primary_release_date.asc'
          : 'first_air_date.asc',
    },
    {
      label: 'Z-a',
      value: this.type() === 'movies' ? 'title.desc' : 'name.desc',
    },
    {
      label: 'A-z',
      value: this.type() === 'movies' ? 'title.asc' : 'name.asc',
    },
  ];

  selectedGenres: number[] = [];
  selectedSortBy: string = this.sortOptions[0].value;

  apply = output<{ genres: number[]; sortBy: string }>();

  isGenresOpen = false;

  toggleGenres() {
    this.isGenresOpen = !this.isGenresOpen;
  }

  toggleGenre(id: number) {
    if (this.selectedGenres.includes(id)) {
      this.selectedGenres = this.selectedGenres.filter((g) => g !== id);
    } else {
      this.selectedGenres.push(id);
    }
  }

  applyFilters() {
    this.apply.emit({
      genres: this.selectedGenres,
      sortBy: this.selectedSortBy,
    });
  }
}
