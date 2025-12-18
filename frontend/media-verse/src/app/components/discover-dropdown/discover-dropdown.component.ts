import {
  Component,
  ElementRef,
  HostListener,
  Input,
  WritableSignal,
} from '@angular/core';
import { SelectOption } from '../../models/selectoption';

@Component({
  selector: 'app-discover-dropdown',
  imports: [],
  templateUrl: './discover-dropdown.component.html',
  styleUrl: './discover-dropdown.component.scss',
})
export class DiscoverDropdownComponent {
  open: boolean = false;
  @Input() selected!: WritableSignal<SelectOption>;

  types: SelectOption[] = [
    { label: 'Movies', value: 'movies' },
    { label: 'Series', value: 'series' },
    //{ label: 'Books', value: 'books' },
    //{ label: 'Video Games', value: 'videogames' },
  ];

  constructor(private eRef: ElementRef) {}

  toggle() {
    this.open = !this.open;
  }

  select(t: SelectOption, event: Event): void {
    event.stopPropagation();
    this.selected.set(t);
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }
}
