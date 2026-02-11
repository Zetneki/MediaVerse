import { ThemeName } from '../utils/theme.registry';

export interface UserTheme {
  id: number;
  name: ThemeName;
  createdAt: string;
}
