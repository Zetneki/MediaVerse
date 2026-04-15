import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';
import { User } from '../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlockchainService } from '../../services/blockchain.service';
import { NotificationService } from '../../services/notification.service';
import { QuestsService } from '../../services/quests.service';
import { Quest } from '../../models/quest';
import { QuestComponent } from '../../components/quest/quest.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterLink } from '@angular/router';
import { ClaimQuestResponse } from '../../models/claimquestresponse';
import { ThemeName } from '../../utils/theme.registry';
import { UserService } from '../../services/user.service';
import { THEME_PRESETS } from '../../utils/theme.registry';
import { ThemeCardComponent } from '../../components/theme-card/theme-card.component';
import { THEME_PRICES } from '../../utils/prices.registry';
import { ThemeService } from '../../services/theme.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SkeletonQuestComponent } from '../../components/skeleton-quest/skeleton-quest.component';

@Component({
  selector: 'app-quests',
  imports: [
    ButtonModule,
    QuestComponent,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    RouterLink,
    ThemeCardComponent,
    SkeletonQuestComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '600ms 50ms ease',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class QuestsComponent {
  private destroyRef = inject(DestroyRef);
  themeService = inject(ThemeService);
  questSkeletonArray = Array(2);
  user!: User;
  walletConnected = signal<boolean>(false);
  walletAddress = signal<string>('');
  isConnecting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  questLoading = signal<boolean>(false);
  claimLoadingSlot = signal<number | null>(null);
  isBalanceLoading = signal<boolean>(false);
  purchaseThemeLoading = signal<ThemeName | null>(null);
  tokenBalance = signal<string>('');
  quests = signal<Quest[]>([]);
  canReroll = signal<boolean>(false);
  nextRerollIn = signal<number>(0);
  ownedThemes = signal<ThemeName[]>([]);
  allThemes = signal<ThemeName[]>([]);

  isLargeScreen = signal<boolean>(window.innerWidth > 1024);
  isSmallScreen = signal<boolean>(window.innerWidth < 501);

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private blockchainService: BlockchainService,
    private notificationService: NotificationService,
    private questsService: QuestsService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
  ) {
    this.authService.currentUser$
      .pipe(
        filter((user): user is User => !!user),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((user) => {
        this.user = user;

        if (user.wallet_address && user.wallet_verified) {
          this.walletConnected.set(true);
          this.walletAddress.set(user.wallet_address);
        } else {
          this.walletConnected.set(false);
          this.walletAddress.set('');
        }

        this.loadQuests();

        this.userService.getUserThemes().then((themes) => {
          this.ownedThemes.set(themes.map((t) => t.name));
        });

        this.allThemes.set(Object.keys(THEME_PRESETS) as ThemeName[]);
      });

    effect(() => {
      const address = this.walletAddress();

      if (!address) return;

      this.loadTokenBalance(address);
    });

    this.setupResizeListener();
  }

  private setupResizeListener() {
    const handleResize = () => {
      this.isLargeScreen.set(window.innerWidth > 1024);
      this.isSmallScreen.set(window.innerWidth < 501);
    };

    window.addEventListener('resize', handleResize);

    effect(() => {
      return () => window.removeEventListener('resize', handleResize);
    });
  }

  remainingThemes = computed(() => {
    return this.allThemes()
      .filter((t) => !this.ownedThemes().includes(t))
      .sort((a, b) => {
        const priceDiff = THEME_PRICES[a] - THEME_PRICES[b];
        if (priceDiff !== 0) return priceDiff;
        return a.localeCompare(b);
      });
  });

  questButtonSize = computed(() => {
    if (this.isLargeScreen()) return 'large';
    return this.isSmallScreen() ? 'small' : undefined;
  });

  buttonSize = computed(() => (this.isLargeScreen() ? undefined : 'small'));

  loadQuests() {
    this.isLoading.set(true);

    this.questsService
      .getUserQuests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (questResponse) => {
          this.quests.set(questResponse.quests);
          this.canReroll.set(questResponse.canReroll);
          this.nextRerollIn.set(questResponse.nextRerollIn);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.notificationService.error(
            err.error?.error ?? 'Failed to get quests',
          );
          this.isLoading.set(false);
        },
      });
  }

  rerollQuest(slotNumber: number) {
    this.questLoading.set(true);

    if (!this.canReroll()) {
      this.confirmationService.confirm({
        message: this.nextRerollIn() + ' hour(s) remaining of reroll cooldown.',
        header: 'Cooldown',
        closeOnEscape: true,
        dismissableMask: true,
        rejectVisible: true,
        acceptVisible: false,
        rejectButtonProps: {
          severity: 'secondary',
          label: 'Close',
        },
      });
      this.questLoading.set(false);
    } else {
      this.confirmationService.confirm({
        message: 'Are you sure you want to reroll this question?',
        header: 'Confirmation',
        closeOnEscape: true,
        dismissableMask: true,
        rejectButtonProps: {
          severity: 'secondary',
          label: 'Cancel',
        },
        acceptButtonProps: {
          severity: 'success',
          label: 'Reroll',
        },
        accept: () => {
          this.questsService
            .rerollQuestSlot(slotNumber)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.notificationService.success('Quest rerolled successfully');
                this.loadQuests();
                this.questLoading.set(false);
                this.loadTokenBalance(this.walletAddress());
              },
              error: (err) => {
                this.notificationService.error(
                  err.error?.error ?? 'Failed to reroll quest',
                );
                this.questLoading.set(false);
              },
            });
        },
      });
      this.questLoading.set(false);
    }
  }

  claimQuestReward(slotNumber: number) {
    this.claimLoadingSlot.set(slotNumber);
    this.questLoading.set(true);

    this.questsService
      .claimQuestReward(slotNumber)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (res: ClaimQuestResponse) => {
          this.notificationService.success('Quest reward claimed successfully');

          //Wait for transaction
          if (res.txHash) {
            await this.blockchainService.waitForTransaction(res.txHash);
          }

          this.loadQuests();
          this.claimLoadingSlot.set(null);
          this.questLoading.set(false);
          this.loadTokenBalance(this.walletAddress());
        },
        error: (err) => {
          this.notificationService.error(
            err.error?.error ?? 'Failed to claim quest reward',
          );
          this.claimLoadingSlot.set(null);
          this.questLoading.set(false);
        },
      });
  }

  redirectToMetamask() {
    window.open('https://metamask.io/download/', '_blank');
  }

  get hasMetamask(): boolean {
    return !!(window as any).ethereum;
  }

  async onConnectWallet() {
    try {
      this.isConnecting.set(true);

      const walletAddress = await this.walletService.connectWallet(
        this.user.id,
      );

      this.walletConnected.set(true);
      this.walletAddress.set(walletAddress);

      this.notificationService.success('Wallet connected successfully!');

      await this.authService.loadUserFromToken();
    } catch (err: any) {
      let errorMessage;

      if (err.message.toLowerCase().includes('user rejected action')) return;
      else if (err.message === 'MetaMask not installed')
        errorMessage = err.message;
      else errorMessage = err.error?.error ?? 'Failed to connect wallet';

      this.notificationService.error(errorMessage);
    } finally {
      this.isConnecting.set(false);
    }
  }

  async onDisconnectWallet() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to disconnect your wallet?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Disconnect',
      },
      accept: async () => {
        try {
          await this.walletService.disconnectWallet();

          this.walletConnected.set(false);
          this.walletAddress.set('');

          this.notificationService.success('Wallet disconnected');

          await this.authService.loadUserFromToken();
        } catch (err: any) {
          const errorMessage =
            err.error?.error || 'Failed to disconnect wallet';

          this.notificationService.error(errorMessage);
        }
      },
    });
  }

  async loadTokenBalance(address: string) {
    if (!this.walletConnected() || !this.hasMetamask) return;
    try {
      this.isBalanceLoading.set(true);
      const balance = await this.blockchainService.getTokenBalance(address);
      this.tokenBalance.set(balance);
    } catch (err: any) {
      this.notificationService.error(
        err.error?.error ?? 'Failed to get token balance',
      );
    } finally {
      this.isBalanceLoading.set(false);
    }
  }

  async themePurchase(theme: ThemeName) {
    try {
      this.purchaseThemeLoading.set(theme);

      const txHash = await this.blockchainService.purchaseThemeGasless(theme);

      if (txHash) {
        await this.blockchainService.waitForTransaction(txHash);
      }

      this.notificationService.success(
        `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme purchased successfully!`,
      );

      // Reload user
      this.loadTokenBalance(this.walletAddress());
      await this.authService.loadUserFromToken();
    } catch (err: any) {
      const userRejected = err?.code === 'ACTION_REJECTED';

      if (userRejected) {
        this.notificationService.error('Purchase cancelled');
      } else if (Number(this.tokenBalance()) < THEME_PRICES[theme]) {
        this.notificationService.error(
          'Your balance is too low to buy this theme',
        );
      } else {
        this.notificationService.error(err.error?.error ?? 'Purchase failed');
      }
    } finally {
      this.purchaseThemeLoading.set(null);
    }
  }
}
