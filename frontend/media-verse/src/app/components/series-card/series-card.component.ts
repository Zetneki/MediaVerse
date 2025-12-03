import { Component, input, OnInit } from '@angular/core';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Series } from '../../models/series';

@Component({
  selector: 'app-series-card',
  imports: [TruncatePipe, KnobModule, FormsModule, DatePipe],
  templateUrl: './series-card.component.html',
  styleUrl: './series-card.component.scss',
})
export class SeriesCardComponent implements OnInit {
  series = input.required<Series>();
  value!: number;

  ngOnInit(): void {
    this.value = Math.round(this.series().vote_average * 10) / 10;
  }

  //itt majd ha tobb mindent akarok megjeleniteni lehet igy is <Movie | Book | VideoGame>
}
