import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ModalMode = 'delete' | 'serviceChange';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @Input() mode: ModalMode = 'delete';
  @Input() car: any | null = null;
  @Input() successMessage = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() confirmServiceChange = new EventEmitter<void>();
}
