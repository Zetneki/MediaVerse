import { Quest } from './quest';

export interface ClaimQuestResponse {
  txHash: string;
  newQuest: Quest;
}
