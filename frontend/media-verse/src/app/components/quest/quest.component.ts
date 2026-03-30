import { Component, input, output } from '@angular/core';
import { Quest } from '../../models/quest';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule, Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-quest',
  imports: [ButtonModule, ProgressBarModule, Tooltip],
  templateUrl: './quest.component.html',
  styleUrl: './quest.component.scss',
})
export class QuestComponent {
  quest = input.required<Quest>();
  buttonSize = input<'small' | 'large' | undefined>();

  questLoading = input<boolean>(false);
  isClaimLoading = input<boolean>(false);

  rerollClicked = output<number>();
  claimClicked = output<number>();

  constructor() {}
}
