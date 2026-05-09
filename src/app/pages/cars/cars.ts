import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Api } from '../../services/api';
import { Form, CarsFormMode, CarsFormSubmit } from './components/form/form';
import { Gallery } from './components/gallery/gallery';

@Component({
  selector: 'app-cars',
  imports: [FormsModule, Form, Gallery, RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
})
export class Cars implements OnDestroy {
  showCarForm = signal(false);
  carFormMode = signal<CarsFormMode>('create');
  selectedCar = signal<any | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  showDashboardBackButton = signal(history.state?.fromDashboard === true);
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private apiService: Api,
    private router: Router,
  ) { }

  ngOnDestroy(): void {
    this.clearSuccessMessageTimeout();
  }

  openCarForm(mode: CarsFormMode): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.clearSuccessMessageTimeout();
    this.selectedCar.set(null);
    this.carFormMode.set(mode);
    this.showCarForm.set(true);
  }

  openEditCarForm(car: any): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.clearSuccessMessageTimeout();
    this.selectedCar.set(car);
    this.carFormMode.set('edit');
    this.showCarForm.set(true);
  }

  closeCarForm(): void {
    this.showCarForm.set(false);
  }

  submitCarForm(submission: CarsFormSubmit): void {
    this.errorMessage.set('');
    const { formData, deletedImageUrls } = submission;

    if (this.carFormMode() === 'create') {
      this.apiService.createCar(formData).subscribe({
        next: () => {
          this.showTemporarySuccessMessage('Voiture ajoutée avec succès.');
          this.redirectToCars();
        },
        error: (error) => {
          console.log(error)
          this.errorMessage.set('Erreur lors de la création.')
        },
      });
      return;
    }

    const car = this.selectedCar();
    const carId = car?.id;

    if (carId !== undefined) {
      this.apiService.updateCar(carId, formData).subscribe({
        next: () => {
          this.showTemporarySuccessMessage('Voiture modifiée avec succès.');
          this.deleteSubmittedImages(carId, deletedImageUrls)
        },
        error: (error) => {
          console.log(error)
          this.errorMessage.set('Erreur lors de la modification.')
        },
      });
      return;
    }

  }

  private redirectToCars(): void {
    this.closeCarForm();
    this.router.navigate(['/stock']);
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

  private deleteSubmittedImages(carId: number, deletedImageUrls: string[]): void {
    if (!deletedImageUrls.length) {
      this.redirectToCars();
      return;
    }

    forkJoin(deletedImageUrls.map((url) => this.apiService.deleteCarImage(carId, { url }))).subscribe({
      next: () => this.redirectToCars(),
      error: (error) => {
        console.log(error)
        this.errorMessage.set('Erreur lors de la suppression des images.')
      },
    });
  }

}
