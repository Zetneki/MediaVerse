import { Injectable, signal } from '@angular/core';
import { useTheme } from '@primeng/themes';
import { THEME_PRESETS, ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../types/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeName = 'indigo';
  activePreviewTheme = signal<ThemeName | null>(null);
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

  async previewTheme(theme: ThemeName) {
    const preset = THEME_PRESETS[theme];
    if (!preset) return;

    useTheme({
      preset,
      options: { darkModeSelector: '.p-dark' },
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

  togglePreview(theme: ThemeName, activeTheme: ThemeName, isOn: boolean) {
    if (isOn) {
      this.activePreviewTheme.set(theme);
      this.previewTheme(theme);
    } else {
      this.activePreviewTheme.set(null);
      this.applyTheme(activeTheme);
    }
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
