import { Component, input, OnInit } from '@angular/core';
import { Movie } from '../../models/movie';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [TruncatePipe, KnobModule, FormsModule, DatePipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  movie = input.required<Movie>();
  value!: number;

  ngOnInit(): void {
    this.value = Math.round(this.movie().vote_average * 10) / 10;
  }

  //itt majd ha tobb mindent akarok megjeleniteni lehet igy is <Movie | Book | VideoGame>
}
