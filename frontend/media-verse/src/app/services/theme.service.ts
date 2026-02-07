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
type ColorMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeName = 'my';
  private dark = false;
  private mode: ColorMode = 'system';

  private systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {}

  init() {
    useTheme({
      preset: MyPreset,
      options: { darkModeSelector: '.p-dark' },
    });

    this.systemDarkQuery.addEventListener('change', () => {
      if (this.mode === 'system') {
        this.applyMode();
      }
    });

    this.applyMode();
  }

  /* ===== THEME (PRESET) ===== */

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'my' ? 'another' : 'my';

    useTheme({
      preset: this.currentTheme === 'my' ? MyPreset : AnotherPreset,
      options: { darkModeSelector: '.p-dark' },
    });
  }

  private applyMode() {
    let dark: boolean;

    if (this.mode === 'dark') {
      dark = true;
    } else if (this.mode === 'light') {
      dark = false;
    } else {
      dark = this.systemDarkQuery.matches;
    }

    document.documentElement.classList.toggle('p-dark', dark);
  }

  setMode(mode: ColorMode) {
    this.mode = mode;
    this.applyMode();
  }

  getMode(): ColorMode {
    return this.mode;
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
