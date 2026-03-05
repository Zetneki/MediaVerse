import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async connectWallet(userId: number): Promise<string> {
    //Check MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    //Request account access
    const accounts = await provider.send('eth_requestAccounts', []);
    const walletAddress = accounts[0];

    //Sign message
    const signer = await provider.getSigner();
    const message = `Connect wallet to MediaVerse account ${userId}`;
    const signature = await signer.signMessage(message);

    //Send to backend
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/wallet/connect`, {
        walletAddress,
        signature,
      }),
    );

    return walletAddress;
  }

  async disconnectWallet(): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/wallet/disconnect`));
  }

  async getWalletInfo(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}/wallet`));
  }
}
