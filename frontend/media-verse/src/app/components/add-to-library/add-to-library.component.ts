import { Component, Input, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-add-to-library',
  imports: [DialogModule, ButtonModule],
  templateUrl: './add-to-library.component.html',
  styleUrl: './add-to-library.component.scss',
})
export class AddToLibraryComponent {
  visible = input<boolean>(false);
  visibleChange = output<boolean>();

  close() {
    this.visibleChange.emit(false);
  }

  onDialogVisibilityChange(value: boolean) {
    this.visibleChange.emit(value);
  }
}
