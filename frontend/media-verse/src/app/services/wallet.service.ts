import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  async connectWallet(userId: number): Promise<string> {
    try {
      //Check MetaMask
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      //Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];

      //Check and switch network
      await this.ensureCorrectNetwork();

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

      //Auto-add MVT token
      await this.addTokenToWallet();

      return walletAddress;
    } catch (err) {
      throw err;
    }
  }

  async disconnectWallet(): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/wallet/disconnect`));
  }

  async getWalletInfo(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}/wallet`));
  }

  //Ensure correct network
  private async ensureCorrectNetwork(): Promise<void> {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = network.chainId;

    const targetChainId = environment.chainId;

    if (currentChainId === targetChainId) return;

    try {
      //Try to switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await this.addNetwork();
      } else {
        throw err;
      }
    }
  }

  //Add network to Metamask
  private async addNetwork(): Promise<void> {
    if (!window.ethereum) return;

    const chainId = environment.chainId;
    const chainIdHex = `0x${environment.chainId.toString(16)}`;

    //Localhost or Testnet params
    const networkParams =
      chainId === 1337n
        ? {
            chainId: chainIdHex,
            chainName: 'Hardhat Local',
            rpcUrls: [environment.rpcUrl],
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          }
        : {
            chainId: chainIdHex, // Sepolia
            chainName: 'Sepolia Testnet',
            rpcUrls: [environment.rpcUrl],
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkParams],
    });
  }

  //Add MVT token to MetaMask
  private async addTokenToWallet(): Promise<void> {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: environment.tokenContractAddress,
            symbol: 'MVT',
            decimals: 18,
            image:
              'https://raw.githubusercontent.com/Zetneki/MediaVerse/refs/heads/main/frontend/media-verse/public/assets/logo-1.png',
          },
        },
      });
    } catch (err) {}
  }
}
