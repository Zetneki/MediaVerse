export interface Quest {
  id: number;
  user_id: number;
  slot_number: number;
  quest_id: number;
  current_progress: number;
  required_progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  started_at: string;
  completed_at: string;
  claimed_at: string;
  title: string;
  description: string;
  requirement_type: string;
  requirement_count: number;
  content_type: string;
  genre_filter: string[];
  reward_tokens: number;
}
