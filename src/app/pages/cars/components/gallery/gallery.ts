import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import Tooltip from 'bootstrap/js/dist/tooltip';
import { Api } from '../../../../services/api';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-gallery',
  imports: [Modal],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  @Output() editCar = new EventEmitter<any>();

  cars = signal<any[]>([]);
  carToDelete = signal<any | null>(null);
  carToChangeService = signal<any | null>(null);
  deleteSuccessMessage = signal('');
  serviceChangeSuccessMessage = signal('');
  currentPage = 1;
  pageSize = 12;
  private tooltips: Tooltip[] = [];

  constructor(
    private apiService: Api,
    private elementRef: ElementRef<HTMLElement>,
  ) { }

  ngOnInit(): void {
    this.apiService.findAllCars().subscribe({
      next: (response) => {
        this.cars.set(Array.isArray(response.body) ? response.body : []);
        setTimeout(() => this.initializeTooltips());
      },
      error: (error) => console.log(error),
    });
  }

  ngOnDestroy(): void {
    this.disposeTooltips();
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

  getPagedCars(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.cars().slice(start, start + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.cars().length / this.pageSize);
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
    setTimeout(() => this.initializeTooltips());
  }

  openDeleteModal(car: any): void {
    this.deleteSuccessMessage.set('');
    this.carToDelete.set(car);
  }

  closeDeleteModal(): void {
    this.deleteSuccessMessage.set('');
    this.carToDelete.set(null);
  }

  openServiceModal(car: any): void {
    this.serviceChangeSuccessMessage.set('');
    this.carToChangeService.set(car);
  }

  closeServiceModal(): void {
    this.serviceChangeSuccessMessage.set('');
    this.carToChangeService.set(null);
  }

  changeSelectedCarService(): void {
    const car = this.carToChangeService();
    const carId = car?.id;
    const newService = car?.service === 'Leasing' ? 'Sale' : 'Leasing';

    if (carId === undefined) {
      return;
    }

    this.apiService.updateCarService(carId, newService).subscribe({
      next: () => {
        this.cars.update((cars) => cars.map((currentCar) => {
          const currentCarId = currentCar?.id;
          return currentCarId === carId ? { ...currentCar, service: newService } : currentCar;
        }));
        this.serviceChangeSuccessMessage.set('Type de service modifié avec succès.');
        setTimeout(() => this.closeServiceModal(), 1300);
      },
      error: (error) => console.log(error),
    });
  }

  deleteSelectedCar(): void {
    const car = this.carToDelete();
    const carId = car?.id;

    if (carId === undefined) {
      return;
    }

    this.apiService.deleteCar(carId).subscribe({
      next: () => {
        this.cars.update((cars) => cars.filter((currentCar) => {
          const currentCarId = currentCar?.id;
          return currentCarId !== carId;
        }));
        if (this.currentPage > this.getTotalPages()) {
          this.currentPage = Math.max(this.getTotalPages(), 1);
        }
        this.deleteSuccessMessage.set('Voiture supprimée avec succès.');
        setTimeout(() => this.initializeTooltips());
        setTimeout(() => this.closeDeleteModal(), 1200);
      },
      error: (error) => console.log(error),
    });
  }

  private initializeTooltips(): void {
    this.disposeTooltips();

    const tooltipElements = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]');
    this.tooltips = Array.from(tooltipElements).map((element) => new Tooltip(element));
  }

  private disposeTooltips(): void {
    this.tooltips.forEach((tooltip) => tooltip.dispose());
    this.tooltips = [];
  }

}
