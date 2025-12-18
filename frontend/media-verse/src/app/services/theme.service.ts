import { Injectable } from '@angular/core';
import { useTheme } from '@primeng/themes';
import { AnotherPreset, MyPreset } from '../preset1';

type ThemeName = 'my' | 'another';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeName = 'my';
  private dark = false;

  constructor() {
    // alap theme
    useTheme({
      preset: MyPreset,
      options: { darkModeSelector: '.p-dark' },
    });

    // alap mód: LIGHT
    document.documentElement.classList.remove('p-dark');
  }

  /* ===== THEME (PRESET) ===== */

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'my' ? 'another' : 'my';

    useTheme({
      preset: this.currentTheme === 'my' ? MyPreset : AnotherPreset,
      options: { darkModeSelector: '.p-dark' },
    });
  }

  /* ===== DARK MODE ===== */

  toggleDarkMode() {
    this.dark = !this.dark;
    document.documentElement.classList.toggle('p-dark', this.dark);
  }

  isDarkMode(): boolean {
    return this.dark;
  }

  getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }
}
