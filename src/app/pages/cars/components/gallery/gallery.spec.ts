import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Api } from '../../../../services/api';
import { Gallery } from './gallery';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let apiMock: any;
  const storageUrl = 'https://project.supabase.co/storage/v1/object/public/cars';
  const cars = [
    {
      id: 1,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Leasing',
      isAvailable: true,
      images: [`${storageUrl}/genesis-gv80-front.jpg`],
    },
    {
      id: 2,
      brand: 'Genesis',
      model: 'GV80',
      price: 39000,
      service: 'Sale',
      isAvailable: false,
      images: [`${storageUrl}/genesis-gv80-side.jpg`],
    },
  ];

  beforeEach(async () => {
    apiMock = {
      findAllCars: vi.fn().mockReturnValue(of({ body: [] })),
      updateCarService: vi.fn(),
      deleteCar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        { provide: Api, useValue: apiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cars from an array response body', () => {
    apiMock.findAllCars.mockReturnValue(of({ body: cars }));

    component.ngOnInit();

    expect(component.cars()).toEqual(cars);
  });

  it('should keep an empty cars list when the response body is not an array', () => {
    apiMock.findAllCars.mockReturnValue(of({ body: {} }));

    component.ngOnInit();

    expect(component.cars()).toEqual([]);
  });

  it('should keep an empty cars list when loading cars fails', () => {
    apiMock.findAllCars.mockReturnValue(throwError(() => new Error('')));

    component.ngOnInit();

    expect(component.cars()).toEqual([]);
  });

  it('should return display labels for known services', () => {
    expect(component.getServiceLabel('Leasing')).toBe('Location');
    expect(component.getServiceLabel('Sale')).toBe('Vente');
  });

  it('should return display labels for known availabilities', () => {
    expect(component.getAvailabilityLabel({ isAvailable: true, service: 'Sale' })).toBe('Disponible');
    expect(component.getAvailabilityLabel({ isAvailable: false, service: 'Sale' })).toBe('Vendue');
    expect(component.getAvailabilityLabel({ isAvailable: false, service: 'Leasing' })).toBe('En location');
  });

  it('should open and close the delete modal state', () => {
    const car = cars[0];
    component.deleteSuccessMessage.set('Old message');

    component.openDeleteModal(car);
    expect(component.carToDelete()).toBe(car);
    expect(component.deleteSuccessMessage()).toBe('');

    component.closeDeleteModal();
    expect(component.carToDelete()).toBeNull();
  });

  it('should open and close the service modal state', () => {
    const car = cars[0];
    component.serviceChangeSuccessMessage.set('Old message');

    component.openServiceModal(car);
    expect(component.carToChangeService()).toBe(car);
    expect(component.serviceChangeSuccessMessage()).toBe('');

    component.closeServiceModal();
    expect(component.carToChangeService()).toBeNull();
  });

  it('should change a leasing car to sale', () => {
    apiMock.updateCarService.mockReturnValue(of({ status: 200 }));
    component.cars.set(cars);
    component.carToChangeService.set(cars[0]);

    component.changeSelectedCarService();

    expect(apiMock.updateCarService).toHaveBeenCalledWith(1, 'Sale');
    expect(component.cars()[0].service).toBe('Sale');
    expect(component.serviceChangeSuccessMessage()).toBe('Type de service modifié avec succès.');
  });

  it('should change a sale car to leasing', () => {
    apiMock.updateCarService.mockReturnValue(of({ status: 200 }));
    component.cars.set(cars);
    component.carToChangeService.set(cars[1]);

    component.changeSelectedCarService();

    expect(apiMock.updateCarService).toHaveBeenCalledWith(2, 'Leasing');
    expect(component.cars()[1].service).toBe('Leasing');
  });

  it('should not change service without a selected car id', () => {
    component.carToChangeService.set({ service: 'Sale' });

    component.changeSelectedCarService();

    expect(apiMock.updateCarService).not.toHaveBeenCalled();
  });

  it('should delete a selected car', () => {
    apiMock.deleteCar.mockReturnValue(of({ status: 200 }));
    component.cars.set(cars);
    component.carToDelete.set(cars[0]);

    component.deleteSelectedCar();

    expect(apiMock.deleteCar).toHaveBeenCalledWith(1);
    expect(component.cars()).toEqual([cars[1]]);
    expect(component.deleteSuccessMessage()).toBe('Voiture supprimée avec succès.');
  });

  it('should not delete without a selected car id', () => {
    component.carToDelete.set({ brand: 'Genesis', model: 'GV80' });

    component.deleteSelectedCar();

    expect(apiMock.deleteCar).not.toHaveBeenCalled();
  });

  it('should filter cars by selected service', () => {
    component.cars.set(cars);
    component.changeService('Leasing');

    expect(component.getFilteredCars()).toEqual([cars[0]]);
  });

  it('should show all cars when no service is selected', () => {
    component.cars.set(cars);
    component.changeService('');

    expect(component.getFilteredCars()).toEqual(cars);
  });

  it('should reset to the first page when changing service', () => {
    component.currentPage = 2;

    component.changeService('Sale');

    expect(component.currentPage).toBe(1);
  });

  it('should filter cars by brand or model search', () => {
    component.cars.set(cars);

    component.changeSearch('gv80');

    expect(component.getFilteredCars()).toEqual(cars);
  });

  it('should filter cars by id search', () => {
    component.cars.set(cars);

    component.changeSearch('2');

    expect(component.getFilteredCars()).toEqual([cars[1]]);
  });

  it('should search within the selected service', () => {
    component.cars.set(cars);
    component.changeService('Sale');
    component.changeSearch('gv80');

    expect(component.getFilteredCars()).toEqual([cars[1]]);
  });

  it('should filter cars by selected availability', () => {
    component.cars.set([
      ...cars,
      {
        id: 3,
        brand: 'Genesis',
        model: 'GV80',
        price: 45000,
        service: 'Leasing',
        isAvailable: false,
        images: [],
      },
    ]);

    component.changeAvailability('Leasing');

    expect(component.getFilteredCars()).toEqual([
      {
        id: 3,
        brand: 'Genesis',
        model: 'GV80',
        price: 45000,
        service: 'Leasing',
        isAvailable: false,
        images: [],
      },
    ]);
  });

  it('should reset to the first page when changing availability', () => {
    component.currentPage = 2;

    component.changeAvailability('true');

    expect(component.currentPage).toBe(1);
  });
});
