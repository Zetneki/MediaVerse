import { Injectable } from '@angular/core';
import { useTheme } from '@primeng/themes';
import {
  IndigoPreset,
  GreenPreset,
  EmeraldPreset,
  BluePreset,
  VioletPreset,
  RosePreset,
  Noir,
  LimePreset,
  RedPreset,
  OrangePreset,
  AmberPreset,
  YellowPreset,
  CyanPreset,
  SkyPreset,
  PurplePreset,
  FuchsiaPreset,
  PinkPreset,
} from '../utils/themePresets';

type ThemeName =
  | 'indigo'
  | 'green'
  | 'emerald'
  | 'blue'
  | 'violet'
  | 'rose'
  | 'noir'
  | 'lime'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'cyan'
  | 'sky'
  | 'purple'
  | 'fuchsia'
  | 'pink';
type ColorMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeName = 'indigo';
  private dark = false;
  private mode: ColorMode = 'system';

  private systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {}

  init() {
    useTheme({
      preset: IndigoPreset,
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
    // this.currentTheme = this.currentTheme === 'my' ? 'another' : 'my';
    // useTheme({
    //   preset: this.currentTheme === 'my' ? MyPreset : AnotherPreset,
    //   options: { darkModeSelector: '.p-dark' },
    // });
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
      case 'indigo':
        useTheme({
          preset: IndigoPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'green':
        useTheme({
          preset: GreenPreset,
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
      case 'lime':
        useTheme({
          preset: LimePreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'red':
        useTheme({
          preset: RedPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'orange':
        useTheme({
          preset: OrangePreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'amber':
        useTheme({
          preset: AmberPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'yellow':
        useTheme({
          preset: YellowPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'cyan':
        useTheme({
          preset: CyanPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'sky':
        useTheme({
          preset: SkyPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'purple':
        useTheme({
          preset: PurplePreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'fuchsia':
        useTheme({
          preset: FuchsiaPreset,
          options: { darkModeSelector: '.p-dark' },
        });
        break;
      case 'pink':
        useTheme({
          preset: PinkPreset,
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
