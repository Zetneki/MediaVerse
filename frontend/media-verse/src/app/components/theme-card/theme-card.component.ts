import { Component, computed, input, output } from '@angular/core';
import { ThemeName } from '../../utils/theme.registry';
import { ButtonModule } from 'primeng/button';
import { THEME_COLORS } from '../../utils/colors.registry';
import { THEME_PRICES } from '../../utils/prices.registry';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-card',
  imports: [ButtonModule, CapitalizePipe, ToggleSwitchModule, FormsModule],
  templateUrl: './theme-card.component.html',
  styleUrl: './theme-card.component.scss',
})
export class ThemeCardComponent {
  theme = input.required<ThemeName>();
  buttonSize = input<'small' | 'large' | undefined>();
  isPurchaseLoading = input<boolean>(false);

  isPreviewing = input<boolean>(false);
  previewToggled = output<boolean>();

  buyClicked = output<ThemeName>();

  color = computed(() => THEME_COLORS[this.theme()]);
  price = computed(() => THEME_PRICES[this.theme()]);
}
