import { Injectable } from '@angular/core';
import { useTheme } from '@primeng/themes';
import { AnotherPreset, MyPreset } from '../preset1';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  current = 'my';

  toggleTheme() {
    if (this.current === 'my') {
      useTheme({
        preset: AnotherPreset,
        options: { darkModeSelector: '.my-app-dark' },
      });
      this.current = 'another';
    } else {
      useTheme({
        preset: MyPreset,
        options: { darkModeSelector: '.my-app-dark' },
      });
      this.current = 'my';
    }
  }
}
