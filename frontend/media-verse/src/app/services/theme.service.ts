import { Injectable } from '@angular/core';
import { useTheme } from '@primeng/themes';
import { THEME_PRESETS, ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../utils/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeName = 'indigo';
  private mode: ColorMode = 'system';

  private systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {}

  init() {
    this.applyTheme(this.currentTheme);
    this.applyMode();

    this.systemDarkQuery.addEventListener('change', () => {
      if (this.mode === 'system') {
        this.applyMode();
      }
    });
  }

  async applyTheme(theme: ThemeName) {
    const preset = THEME_PRESETS[theme];
    if (!preset) return;

    this.currentTheme = theme;

    useTheme({
      preset,
      options: { darkModeSelector: '.p-dark' },
    });
  }

  getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  setMode(mode: ColorMode) {
    this.mode = mode;
    this.applyMode();
  }

  getMode(): ColorMode {
    return this.mode;
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
}
