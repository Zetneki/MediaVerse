import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-footer-desktop',
  imports: [RouterLink, ButtonModule],
  templateUrl: './footer-desktop.component.html',
  styleUrl: './footer-desktop.component.scss',
})
export class FooterDesktopComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getYear() {
    return new Date().getFullYear();
  }
}
