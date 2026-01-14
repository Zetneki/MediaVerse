import { Component, input, OnInit } from '@angular/core';
import { Movie } from '../../models/movie';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  imports: [TruncatePipe, KnobModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent implements OnInit {
  movie = input.required<Movie>();
  value!: number;

  ngOnInit(): void {
    this.value = Math.round(this.movie().vote_average * 10) / 10;
  }

  //itt majd ha tobb mindent akarok megjeleniteni lehet igy is <Movie | Book | VideoGame>
}
