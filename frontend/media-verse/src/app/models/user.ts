import { ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../types/theme.type';

export interface User {
  id: number;
  username: string;
  wallet_address: string;
  wallet_verified: boolean;
  wallet_last_verified: string;
  created_at: string;
  active_theme: ThemeName;
  active_dark_light_mode: ColorMode;
}
