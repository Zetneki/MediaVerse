import { Component, input } from '@angular/core';
import { Movie } from '../../models/movie';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-card',
  imports: [TruncatePipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  movie = input.required<Movie>();
  //itt majd ha tobb mindent akarok megjeleniteni lehet igy is <Movie | Book | VideoGame>
}
