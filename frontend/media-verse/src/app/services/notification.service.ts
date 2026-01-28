import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  success(detail: string, summary = 'Success') {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    });
  }

  error(detail: string[] | string, summary = 'Error') {
    const messages = Array.isArray(detail) ? detail : [detail];

    messages.forEach((message) => {
      this.messageService.add({
        severity: 'error',
        summary,
        detail: message,
        life: 3000,
      });
    });
  }

  info(detail: string, summary = 'Info') {
    this.messageService.add({ severity: 'info', summary, detail, life: 3000 });
  }

  warn(detail: string, summary = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail, life: 3000 });
  }
}
