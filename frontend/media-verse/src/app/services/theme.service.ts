import { Injectable } from '@angular/core';
import { useTheme } from '@primeng/themes';
import {
  AnotherPreset,
  MyPreset,
  EmeraldPreset,
  BluePreset,
  VioletPreset,
  RosePreset,
  Noir,
} from '../preset1';

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

  chooseTheme(theme: string) {
    switch (theme) {
      case 'my':
        useTheme({
          preset: MyPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'another':
        useTheme({
          preset: AnotherPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'emerald':
        useTheme({
          preset: EmeraldPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'blue':
        useTheme({
          preset: BluePreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'violet':
        useTheme({
          preset: VioletPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'rose':
        useTheme({
          preset: RosePreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'noir':
        useTheme({
          preset: Noir,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
    }
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
