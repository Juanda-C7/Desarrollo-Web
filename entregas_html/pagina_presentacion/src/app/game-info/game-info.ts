import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-info.html',
  styleUrls: ['./game-info.css']
})
export class GameInfo {
  modalTitle = '';
  modalContent: string = '';
  openTableId: string | null = null;

  toggleTableModal(tableId: string) {
    const tableSection = document.getElementById(tableId);
    if (!tableSection) return;

    const modalElement = document.getElementById('tableModal');
    if (!modalElement) return;

    const modal = new (window as any).bootstrap.Modal(modalElement);

    // Si está abierta, la cierra
    if (this.openTableId === tableId) {
      modal.hide();
      this.openTableId = null;
      return;
    }

    // Clona contenido
    const tableClone = tableSection.cloneNode(true) as HTMLElement;
    this.modalContent = tableClone.innerHTML;
    this.modalTitle = tableSection.querySelector('h2')?.textContent || '';

    this.openTableId = tableId;
    modal.show();
  }
}
