import { Component, Host, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  lastScroll: number = 0;
  hidden = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onScroll() {
    const current = window.scrollY;

    if (current > this.lastScroll && current > 80) {
      this.hidden.set(true);
    } else {
      this.hidden.set(false);
    }

    this.lastScroll = current;
  }

  visible = signal<boolean>(false);

  toggleSidebar() {
    this.visible.set(!this.visible());
  }
}
