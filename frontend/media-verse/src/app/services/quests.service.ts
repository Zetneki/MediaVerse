import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { QuestsResponse } from '../models/questsresponse';

@Injectable({
  providedIn: 'root',
})
export class QuestsService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUserQuests() {
    return this.http.get<QuestsResponse>(`${this.baseUrl}/quests`);
  }

  rerollQuestSlot(slotNumber: number) {
    return this.http.post(`${this.baseUrl}/quests/reroll`, {
      slotNumber,
    });
  }

  claimQuestReward(slotNumber: number) {
    return this.http.post(`${this.baseUrl}/quests/claim`, {
      slotNumber,
    });
  }
}
