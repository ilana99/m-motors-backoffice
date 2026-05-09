import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-car-detailed',
  imports: [RouterLink],
  templateUrl: './car-detailed.html',
  styleUrl: './car-detailed.scss',
})
export class CarDetailed implements OnInit {
  car = signal<any>('');
  private statusLabels: Record<string, string> = {
    Accepted: 'Accepté',
    Rejected: 'Rejeté',
    Pending: 'En cours de traitement',
    Canceled: 'Annulé',
  };

  constructor(private route: ActivatedRoute, private api: Api, public router: Router) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.api.findOneCar(id).subscribe({
        next: (response) => {
          this.car.set(response.body);
        },
        error: (error) => {
          console.log(error);
        }
      })
    }

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

  getAvailabilityLabel(car: any): string {
    if (car.isAvailable === true) {
      return 'Disponible';
    }

    if (car.service === 'Leasing') {
      return 'En location';
    }

    return 'Vendue';
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
}
