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

@Component({
  selector: 'app-quests',
  imports: [
    ButtonModule,
    QuestComponent,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    RouterLink,
  ],
  providers: [ConfirmationService],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent {
  private destroyRef = inject(DestroyRef);
  user!: User;
  walletConnected = signal<boolean>(false);
  walletAddress = signal<string>('');
  isConnecting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  questLoading = signal<boolean>(false);
  claimLoadingSlot = signal<number | null>(null);
  isBalanceLoading = signal<boolean>(false);
  isPurchaseLoading = signal<boolean>(false);
  tokenBalance = signal<string>('');
  quests = signal<Quest[]>([]);
  canReroll = signal<boolean>(false);
  nextRerollIn = signal<number>(0);

  isLargeScreen = signal<boolean>(window.innerWidth > 1024);
  isSmallScreen = signal<boolean>(window.innerWidth < 501);

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private blockchainService: BlockchainService,
    private notificationService: NotificationService,
    private questsService: QuestsService,
    private confirmationService: ConfirmationService,
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

  questButtonSize = computed(() => {
    if (this.isLargeScreen()) return 'large';
    return this.isSmallScreen() ? 'small' : undefined;
  });

  buttonSize = computed(() => (this.isLargeScreen() ? undefined : 'small'));

  loadQuests() {
    this.isLoading.set(true);

    this.questsService.getUserQuests().subscribe({
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
          this.questsService.rerollQuestSlot(slotNumber).subscribe({
            next: (res: any) => {
              this.notificationService.success(res.message);
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

    //rakerdezni hogy biztos akarja-e
  }

  claimQuestReward(slotNumber: number) {
    this.claimLoadingSlot.set(slotNumber);
    this.questLoading.set(true);

    this.questsService.claimQuestReward(slotNumber).subscribe({
      next: () => {
        this.notificationService.success('Quest reward claimed successfully');
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
      const errorMessage =
        err.error?.error || err.message === 'MetaMask not installed'
          ? err.message
          : 'Failed to connect wallet';

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
          //console.error('Wallet error:', err);

          const errorMessage =
            err.error?.error || 'Failed to disconnect wallet';

          this.notificationService.error(errorMessage);
        }
      },
    });
  }

  //todo: ezt majd torlom
  // async onGetWalletInfo() {
  //   try {
  //     this.isLoading.set(true);
  //     console.log(await this.walletService.getWalletInfo());
  //     this.loadTokenBalance(this.walletAddress());

  //     this.notificationService.success('Got token successfully!');
  //   } catch (err: any) {
  //     console.error('Purchase failed:', err);
  //     this.notificationService.error(err.error?.error ?? 'Purchase failed');
  //   } finally {
  //     this.isLoading.set(false);
  //   }
  // }

  async loadTokenBalance(address: string) {
    try {
      this.isBalanceLoading.set(true);
      const balance = await this.blockchainService.getTokenBalance(address);
      this.tokenBalance.set(balance.substring(0, balance.length - 2));
    } catch (err: any) {
      console.error('Failed to get token balance:', err);
      this.notificationService.error(
        err.error?.error ?? 'Failed to get token balance',
      );
    } finally {
      this.isBalanceLoading.set(false);
    }
  }

  async testThemePurchase() {
    try {
      this.isPurchaseLoading.set(true);

      const txHash =
        await this.blockchainService.purchaseThemeGasless('halloween');

      console.log('Theme purchased! TX:', txHash);
      this.notificationService.success(
        'Christmas theme purchased successfully!',
      );

      // Reload user
      this.loadTokenBalance(this.walletAddress());
      await this.authService.loadUserFromToken();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      this.notificationService.error(err.error?.error ?? 'Purchase failed');
    } finally {
      this.isPurchaseLoading.set(false);
    }
  }
}
