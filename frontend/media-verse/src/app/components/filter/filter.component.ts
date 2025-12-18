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
  sortOptions: SortByOption[] = [
    { label: 'Popularity Descending', value: 'popularity.desc' },
    { label: 'Popularity Ascending', value: 'popularity.asc' },
    { label: 'Rating Descending', value: 'vote_average.desc' },
    { label: 'Rating Ascending', value: 'vote_average.asc' },
    { label: 'Release Date Descending', value: 'primary_release_date.desc' },
    { label: 'Release Date Ascending', value: 'primary_release_date.asc' },
    { label: 'Z-a', value: 'title.desc' },
    { label: 'A-z', value: 'title.asc' },
  ];

  genres = input<Genre[]>([]);

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
