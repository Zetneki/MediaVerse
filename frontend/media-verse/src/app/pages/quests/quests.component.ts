import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WalletService } from '../../services/wallet.service';
import { UserService } from '../../services/user.service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';
import { User } from '../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlockchainService } from '../../services/blockchain.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-quests',
  imports: [ButtonModule, DatePipe],
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
  tokenBalance = signal<string>('');

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private blockchainService: BlockchainService,
    private notificationService: NotificationService,
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
      });

    effect(() => {
      const address = this.walletAddress();

      if (!address) return;

      this.loadTokenBalance(address);
    });
  }

  async loadTokenBalance(address: string) {
    try {
      const balance = await this.blockchainService.getTokenBalance(address);
      this.tokenBalance.set(balance);
    } catch (err: any) {
      console.error('Failed to get token balance:', err);
      this.notificationService.error(
        err.error?.error ?? 'Failed to get token balance',
      );
    }
  }

  async onConnectWallet() {
    try {
      this.isConnecting.set(true);

      const walletAddress = await this.walletService.connectWallet(
        this.user.id,
      );

      this.walletConnected.set(true);
      this.walletAddress.set(walletAddress);

      alert('Wallet connected successfully!');

      await this.authService.loadUserFromToken();
    } catch (err: any) {
      //console.error('Wallet connection error:', err);

      const errorMessage =
        err.error?.error || //Backend error message
        err.message || //Client-side error
        'Failed to connect wallet';

      alert(errorMessage);
    } finally {
      this.isConnecting.set(false);
    }
  }

  async onDisconnectWallet() {
    try {
      await this.walletService.disconnectWallet();

      this.walletConnected.set(false);
      this.walletAddress.set('');

      alert('Wallet disconnected');

      await this.authService.loadUserFromToken();
    } catch (err: any) {
      //console.error('Wallet error:', err);

      const errorMessage =
        err.error?.error || // Backend error message
        err.message || // Client-side error
        'Failed to disconnect wallet';

      alert(errorMessage);
    }
  }

  async onGetWalletInfo() {
    try {
      this.isLoading.set(true);
      await this.walletService.getWalletInfo();
      this.loadTokenBalance(this.walletAddress());

      this.notificationService.success('Got token successfully!');
    } catch (err: any) {
      console.error('Purchase failed:', err);
      this.notificationService.error(err.error?.error ?? 'Purchase failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  async testThemePurchase() {
    try {
      this.isLoading.set(true);

      const txHash = await this.blockchainService.purchaseThemeGasless('neon');

      console.log('Theme purchased! TX:', txHash);
      this.notificationService.success(
        'Christmas theme purchased successfully!',
      );

      // Reload user
      await this.authService.loadUserFromToken();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      this.notificationService.error(err.error?.error ?? 'Purchase failed');
    } finally {
      this.isLoading.set(false);
    }
  }
}
