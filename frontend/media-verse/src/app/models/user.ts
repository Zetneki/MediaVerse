import { ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../utils/theme.type';

export interface User {
  id: number;
  username: string;
  wallet_address: string;
  wallet_verified: boolean;
  created_at: string;
  active_theme: ThemeName;
  active_dark_light_mode: ColorMode;
}
