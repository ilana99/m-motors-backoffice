import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  cars = signal<any[]>([]);
  clientfiles = signal<any[]>([]);
  firstCars = computed(() => this.cars().slice(0, 3));
  firstClientfiles = computed(() => this.clientfiles().slice(0, 3));

  private statusLabels: Record<string, string> = {
    Accepted: 'Accepté',
    Rejected: 'Rejeté',
    Pending: 'En cours de traitement',
    Canceled: 'Annulé',
  };

  constructor(private apiService: Api) { }

  ngOnInit(): void {
    this.apiService.findAllCars().subscribe({
      next: (response) => {
        this.cars.set(Array.isArray(response.body) ? response.body : []);
      },
      error: (error) => console.log(error),
    });

    this.apiService.findAllClientfiles().subscribe({
      next: (response) => {
        this.clientfiles.set(Array.isArray(response.body) ? response.body : []);
      },
      error: (error) => console.log(error),
    });
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

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusClass(status: string): string {
    if (status === 'Accepted') {
      return 'text-bg-success';
    }

    if (status === 'Rejected' || status === 'Canceled') {
      return 'text-bg-secondary';
    }

    return 'bg-light';
  }
}
