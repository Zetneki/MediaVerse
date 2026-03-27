import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  private provider!: ethers.BrowserProvider;
  private signer!: ethers.JsonRpcSigner;

  constructor(private http: HttpClient) {}

  async init() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
  }

  async purchaseThemeGasless(theme: string): Promise<string> {
    await this.init();

    const chainId = (await this.provider.getNetwork()).chainId;

    if (chainId !== environment.chainId) {
      throw new Error('Please change your netwok in Metamask');
    }

    const userAddress = await this.signer.getAddress();

    //Contract addresses
    const tokenAddress = environment.tokenContractAddress;
    const marketplaceAddress = environment.marketplaceContractAddress;

    //ABIs
    const TOKEN_ABI = [
      'function nonces(address owner) view returns (uint256)',
      'function name() view returns (string)',
    ];

    const MARKETPLACE_ABI = [
      'function themePrices(string) view returns (uint256)',
    ];

    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      this.provider,
    );
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      MARKETPLACE_ABI,
      this.provider,
    );

    //Get theme price
    const themePrice = await marketplaceContract['themePrices'](theme);

    if (themePrice === 0n) {
      throw new Error('Theme does not exist');
    }

    //Generate permit signature
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const nonce = await tokenContract['nonces'](userAddress);
    const name = await tokenContract['name']();

    const domain = {
      name,
      version: '1',
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const values = {
      owner: userAddress,
      spender: marketplaceAddress,
      value: themePrice,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await this.signer.signTypedData(domain, types, values);
    const { v, r, s } = ethers.Signature.from(signature);

    //Backend call
    const response = await firstValueFrom(
      this.http.post<{ txHash: string }>(`${environment.baseUrl}/user-themes`, {
        theme,
        v,
        r,
        s,
        deadline,
      }),
    );

    return response.txHash;
  }

  async getTokenBalance(userAddress: string): Promise<string> {
    await this.init();

    //Contract address
    const tokenAddress = environment.tokenContractAddress;

    //ABI
    const TOKEN_ABI = [
      'function balanceOf(address account) view returns (uint256)',
    ];

    //Get balance
    const tokenCrontract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      this.provider,
    );
    const balance = await tokenCrontract['balanceOf'](userAddress);

    return Math.floor(parseFloat(ethers.formatEther(balance))).toString();
  }

  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
  ): Promise<void> {
    if (!this.provider) {
      await this.init();
    }
    await this.provider.waitForTransaction(txHash, confirmations);
  }
}
