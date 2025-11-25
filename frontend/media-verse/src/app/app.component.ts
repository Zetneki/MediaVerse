import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterDesktopComponent } from './components/footer-desktop/footer-desktop.component';
import { FooterMobileComponent } from './components/footer-mobile/footer-mobile.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterDesktopComponent,
    FooterMobileComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'media-verse';
}
