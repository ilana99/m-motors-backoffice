import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-clientfile-detailed',
  imports: [RouterLink],
  templateUrl: './clientfile-detailed.html',
  styleUrl: './clientfile-detailed.scss',
})
export class ClientfileDetailed implements OnInit, OnDestroy {
  clientfile = signal<any>('');
  successMessage = signal('');
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(protected router: Router, private route: ActivatedRoute, private api: Api) { }

  private statusLabels: Record<string, string> = {
    Accepted: 'Accepté',
    Rejected: 'Rejeté',
    Pending: 'En cours de traitement',
    Canceled: 'Annulé',
  };

  ngOnInit(): void {
    const clientfileId = this.route?.snapshot.paramMap.get('id');

    if (!clientfileId || !this.api) {
      return;
    }

    this.api.findOneClientfile(Number(clientfileId)).subscribe({
      next: (response) => {
        this.clientfile.set(response.body);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearSuccessMessageTimeout();
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getServiceLabel(service: string): string {
    if (service === 'Leasing') {
      return 'Location';
    }

    if (service === 'Sale') {
      return 'Vente';
    }

    return service;
  }

  updateStatus(status: string): void {
    const clientfile = this.clientfile();

    if (!clientfile?.id || !this.api) {
      return;
    }


    this.api.updateClientfileStatus(Number(clientfile.id), status).subscribe({
      next: (response) => {
        this.clientfile.set(response.body);


        if (status === 'Accepted') {
          this.showTemporarySuccessMessage('Dossier client accepté.');
        }

        if (status === 'Rejected') {
          this.showTemporarySuccessMessage('Dossier client rejeté.');
        }

        if (status === 'Canceled') {
          this.showTemporarySuccessMessage('Dossier client annulé.');
        }
      },
      error: (error) => {
        console.log(error);
      },
    });


  }

  private showTemporarySuccessMessage(message: string): void {
    this.clearSuccessMessageTimeout();
    this.successMessage.set(message);
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage.set('');
      this.successMessageTimeout = null;
    }, 2500);
  }

  private clearSuccessMessageTimeout(): void {
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
      this.successMessageTimeout = null;
    }
  }

}
