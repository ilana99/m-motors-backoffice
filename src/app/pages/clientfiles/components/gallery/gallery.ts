import { Component, computed, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { Api } from '../../../../services/api';
import { RouterLink } from "@angular/router";
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-gallery',
  imports: [RouterLink, Modal],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  @Output() editClientfile = new EventEmitter<any>();

  clientfiles = signal<any[]>([]);
  clientfileToDelete = signal<any | null>(null);
  selectedStatus = signal('');
  deleteSuccessMessage = signal('');
  currentPage = 1;
  pageSize = 12;
  private deleteSuccessMessageTimeout: ReturnType<typeof setTimeout> | null = null;
  statuses = ['Accepted', 'Rejected', 'Pending', 'Canceled'];
  filteredClientfiles = computed(() => {
    const selectedStatus = this.selectedStatus();

    if (!selectedStatus) {
      return this.clientfiles();
    }

    return this.clientfiles().filter((clientfile) => clientfile.status === selectedStatus);
  });
  private statusLabels: Record<string, string> = {
    Accepted: 'Accepté',
    Rejected: 'Rejeté',
    Pending: 'En cours de traitement',
    Canceled: 'Annulé',
  };

  constructor(private apiService: Api) { }

  ngOnInit(): void {
    this.apiService.findAllClientfiles().subscribe({
      next: (response) => {
        this.clientfiles.set(Array.isArray(response.body) ? response.body : []);
      },
      error: (error) => console.log(error),
    });
  }

  ngOnDestroy(): void {
    this.clearDeleteSuccessMessageTimeout();
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusClass(status: string): string {
    if (status === 'Accepted') {
      return 'text-bg-success';
    }

    if (status === 'Rejected') {
      return 'text-bg-danger';
    }

    if (status === 'Canceled') {
      return 'text-bg-secondary';
    }

    return 'bg-light';
  }

  getPagedClientfiles(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredClientfiles().slice(start, start + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredClientfiles().length / this.pageSize);
  }

  getPages(): number[] {
    const pages: number[] = [];

    for (let page = 1; page <= this.getTotalPages(); page++) {
      pages.push(page);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) {
      return;
    }

    this.currentPage = page;
  }

  changeStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage = 1;
  }

  openDeleteModal(event: Event, clientfile: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.clientfileToDelete.set(clientfile);
  }

  closeDeleteModal(): void {
    this.clientfileToDelete.set(null);
  }

  deleteSelectedClientfile(): void {
    const clientfile = this.clientfileToDelete();

    if (clientfile?.id === undefined) {
      return;
    }

    this.apiService.deleteClientfile(clientfile.id).subscribe({
      next: () => {
        this.clientfiles.update((clientfiles) => clientfiles.filter((currentClientfile) => {
          return currentClientfile.id !== clientfile.id;
        }));

        if (this.currentPage > this.getTotalPages()) {
          this.currentPage = Math.max(this.getTotalPages(), 1);
        }

        this.showTemporaryDeleteSuccessMessage();
        this.closeDeleteModal();
      },
      error: (error) => console.log(error),
    });
  }

  private showTemporaryDeleteSuccessMessage(): void {
    this.clearDeleteSuccessMessageTimeout();
    this.deleteSuccessMessage.set('Dossier client supprimé avec succès.');
    this.deleteSuccessMessageTimeout = setTimeout(() => {
      this.deleteSuccessMessage.set('');
      this.deleteSuccessMessageTimeout = null;
    }, 2500);
  }

  private clearDeleteSuccessMessageTimeout(): void {
    if (this.deleteSuccessMessageTimeout) {
      clearTimeout(this.deleteSuccessMessageTimeout);
      this.deleteSuccessMessageTimeout = null;
    }
  }

}
