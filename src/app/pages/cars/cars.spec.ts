import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Api } from '../../services/api';
import { Cars } from './cars';
import { CarsFormSubmit } from './components/form/form';

describe('Cars', () => {
  let component: Cars;
  let fixture: ComponentFixture<Cars>;
  let apiMock: any;
  let routerMock: any;
  const storageUrl = 'https://project.supabase.co/storage/v1/object/public/cars';

  beforeEach(async () => {
    apiMock = {
      createCar: vi.fn(),
      updateCar: vi.fn(),
      deleteCarImage: vi.fn(),
      findAllCars: vi.fn().mockReturnValue(of({ body: [] })),
    };
    routerMock = {
      getCurrentNavigation: vi.fn().mockReturnValue(null),
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Cars],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cars);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the create form and clear previous state', () => {
    component.errorMessage.set('Old error');
    component.successMessage.set('Old success');
    component.selectedCar.set({ id: 1 });

    component.openCarForm('create');

    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
    expect(component.selectedCar()).toBeNull();
    expect(component.carFormMode()).toBe('create');
    expect(component.showCarForm()).toBe(true);
  });

  it('should open the edit form with the selected car', () => {
    component.successMessage.set('Old success');
    const car = {
      id: 1,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: [`${storageUrl}/genesis-gv80.jpg`],
    };

    component.openEditCarForm(car);

    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
    expect(component.selectedCar()).toBe(car);
    expect(component.carFormMode()).toBe('edit');
    expect(component.showCarForm()).toBe(true);
  });

  it('should close the car form', () => {
    component.showCarForm.set(true);

    component.closeCarForm();

    expect(component.showCarForm()).toBe(false);
  });

  it('should create a car and redirect on success', () => {
    vi.useFakeTimers();
    const submission = createSubmission();
    apiMock.createCar.mockReturnValue(of({ status: 201 }));
    component.carFormMode.set('create');
    component.showCarForm.set(true);

    component.submitCarForm(submission);

    expect(apiMock.createCar).toHaveBeenCalledWith(submission.formData);
    expect(component.successMessage()).toBe('Voiture ajoutée avec succès.');
    expect(component.showCarForm()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cars']);

    vi.advanceTimersByTime(2500);
    expect(component.successMessage()).toBe('');
  });

  it('should set an error when car creation fails', () => {
    apiMock.createCar.mockReturnValue(throwError(() => new Error('')));
    component.carFormMode.set('create');

    component.submitCarForm(createSubmission());

    expect(component.errorMessage()).toBe('Erreur lors de la création.');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should update a car and redirect with no deleted images', () => {
    const submission = createSubmission();
    apiMock.updateCar.mockReturnValue(of({ status: 200 }));
    component.carFormMode.set('edit');
    component.selectedCar.set({ id: 12 });
    component.showCarForm.set(true);

    component.submitCarForm(submission);

    expect(apiMock.updateCar).toHaveBeenCalledWith(12, submission.formData);
    expect(apiMock.deleteCarImage).not.toHaveBeenCalled();
    expect(component.showCarForm()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cars']);
  });

  it('should delete queued images only after a car update succeeds', () => {
    const submission = createSubmission([`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`]);
    apiMock.updateCar.mockReturnValue(of({ status: 200 }));
    apiMock.deleteCarImage.mockReturnValue(of({ status: 200 }));
    component.carFormMode.set('edit');
    component.selectedCar.set({ id: 12 });

    component.submitCarForm(submission);

    expect(apiMock.updateCar).toHaveBeenCalledWith(12, submission.formData);
    expect(apiMock.deleteCarImage).toHaveBeenCalledWith(12, { url: `${storageUrl}/genesis-gv80-front.jpg` });
    expect(apiMock.deleteCarImage).toHaveBeenCalledWith(12, { url: `${storageUrl}/genesis-gv80-side.jpg` });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cars']);
  });

  it('should not delete queued images when the car update fails', () => {
    const submission = createSubmission([`${storageUrl}/genesis-gv80.jpg`]);
    apiMock.updateCar.mockReturnValue(throwError(() => new Error('')));
    component.carFormMode.set('edit');
    component.selectedCar.set({ id: 12 });

    component.submitCarForm(submission);

    expect(apiMock.deleteCarImage).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Erreur lors de la modification.');
  });

  it('should set an error when deleting queued images fails', () => {
    const submission = createSubmission([`${storageUrl}/genesis-gv80.jpg`]);
    apiMock.updateCar.mockReturnValue(of({ status: 200 }));
    apiMock.deleteCarImage.mockReturnValue(throwError(() => new Error('')));
    component.carFormMode.set('edit');
    component.selectedCar.set({ id: 12 });

    component.submitCarForm(submission);

    expect(component.errorMessage()).toBe('Erreur lors de la suppression des images.');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});

function createSubmission(deletedImageUrls: string[] = []): CarsFormSubmit {
  return {
    formData: new FormData(),
    deletedImageUrls,
  };
}
