import { Quest } from './quest';

export interface QuestsResponse {
  quests: Quest[];
  canReroll: boolean;
  nextRerollIn: number;
}
