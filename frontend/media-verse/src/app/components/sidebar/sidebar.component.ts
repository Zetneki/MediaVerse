import { Component, Input, WritableSignal } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  imports: [DrawerModule, RouterLink, Button],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() visible!: WritableSignal<boolean>;

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDrawer() {
    this.visible.set(false);
  }
}
