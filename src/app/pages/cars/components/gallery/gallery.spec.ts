import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Api } from '../../../../services/api';
import { Modal } from '../modal/modal';
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
        provideRouter([]),
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
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
    component.deleteSuccessMessage.set('Old message');

    component.openDeleteModal(event, car);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.carToDelete()).toBe(car);
    expect(component.deleteSuccessMessage()).toBe('');

    component.closeDeleteModal();
    expect(component.carToDelete()).toBeNull();
  });

  it('should open and close the service modal state', () => {
    const car = cars[0];
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
    component.serviceChangeSuccessMessage.set('Old message');

    component.openServiceModal(event, car);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.carToChangeService()).toBe(car);
    expect(component.serviceChangeSuccessMessage()).toBe('');

    component.closeServiceModal();
    expect(component.carToChangeService()).toBeNull();
  });

  it('should emit a car edit without opening the detailed page', () => {
    const car = cars[0];
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
    const emitSpy = vi.spyOn(component.editCar, 'emit');

    component.emitEditCar(event, car);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(car);
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

  it('should only show the service change button for available cars', () => {
    component.cars.set(cars);
    fixture.detectChanges();

    const serviceButtons = fixture.nativeElement.querySelectorAll('[aria-label="Modifier le service"]');

    expect(serviceButtons.length).toBe(1);
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
    component.cars.set([
      ...cars,
      {
        id: 3,
        brand: 'Genesis',
        model: 'GV70',
        price: 45000,
        service: 'Sale',
        isAvailable: true,
        images: [],
      },
    ]);

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

  it('should display cars', () => {
    component.cars.set(cars);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Toutes les voitures');
    expect(fixture.nativeElement.textContent).toContain('Toutes les disponibilités');
    expect(fixture.nativeElement.textContent).toContain('Location');
    expect(fixture.nativeElement.textContent).toContain('Vente');
    expect(fixture.nativeElement.textContent).toContain('Genesis');
    expect(fixture.nativeElement.textContent).toContain('GV80');
    expect(fixture.nativeElement.textContent).toContain('42000');
    expect(fixture.nativeElement.textContent).toContain('39000');
  });

  it('should display car images', () => {
    component.cars.set(cars);

    fixture.detectChanges();

    const images = fixture.nativeElement.querySelectorAll('.gallery-car-image');

    expect(images[0].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-front.jpg`);
    expect(images[0].getAttribute('alt')).toBe('Genesis GV80');
    expect(images[1].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-side.jpg`);
    expect(images[1].getAttribute('alt')).toBe('Genesis GV80');
  });

  it('should display a placeholder image when a car has no image', () => {
    component.cars.set([
      {
        ...cars[0],
        images: [],
      },
    ]);

    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.gallery-car-image');

    expect(image.getAttribute('src')).toBe('/car.jpg');
    expect(image.getAttribute('alt')).toBe('car placeholder');
  });

  it('should display an empty message when there are no cars', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune voiture trouvée.');
    expect(fixture.nativeElement.querySelector('.gallery-filter-control')).toBeNull();
  });

  it('should update displayed cars when selecting a service', () => {
    component.cars.set(cars);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    select.value = 'Sale';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.gallery-car-card');

    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Vente');
    expect(cards[0].textContent).toContain('39000');
    expect(cards[0].textContent).not.toContain('Location');
    expect(cards[0].textContent).not.toContain('42000');
  });

  it('should update displayed cars when selecting an availability', () => {
    component.cars.set(cars);
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('select');
    selects[1].value = 'true';
    selects[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.gallery-car-card');

    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Disponible');
    expect(cards[0].textContent).not.toContain('Vendue');
  });

  it('should emit edit from the edit button', () => {
    const emitSpy = vi.spyOn(component.editCar, 'emit');
    component.cars.set(cars);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[aria-label="Modifier cette voiture"]') as HTMLButtonElement;
    editButton.click();

    expect(emitSpy).toHaveBeenCalledWith(cars[0]);
  });

  it('should open and close the delete modal from the template', () => {
    component.cars.set(cars);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[aria-label="Supprimer cette voiture"]') as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(component.carToDelete()).toBe(cars[0]);
    expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.closeModal.emit();
    fixture.detectChanges();

    expect(component.carToDelete()).toBeNull();
    expect(fixture.nativeElement.querySelector('app-modal')).toBeNull();
  });

  it('should delete from the delete modal output', () => {
    apiMock.deleteCar.mockReturnValue(of({ status: 200 }));
    component.cars.set(cars);
    component.carToDelete.set(cars[0]);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.confirmDelete.emit();
    fixture.detectChanges();

    expect(apiMock.deleteCar).toHaveBeenCalledWith(1);
    expect(component.cars()).toEqual([cars[1]]);
    expect(fixture.nativeElement.textContent).toContain('Voiture supprimée avec succès.');
  });

  it('should open and close the service modal from the template', () => {
    component.cars.set(cars);
    fixture.detectChanges();

    const serviceButton = fixture.nativeElement.querySelector('[aria-label="Modifier le service"]') as HTMLButtonElement;
    serviceButton.click();
    fixture.detectChanges();

    expect(component.carToChangeService()).toBe(cars[0]);
    expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.closeModal.emit();
    fixture.detectChanges();

    expect(component.carToChangeService()).toBeNull();
    expect(fixture.nativeElement.querySelector('app-modal')).toBeNull();
  });

  it('should change service from the service modal output', () => {
    apiMock.updateCarService.mockReturnValue(of({ status: 200 }));
    component.cars.set(cars);
    component.carToChangeService.set(cars[0]);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.confirmServiceChange.emit();
    fixture.detectChanges();

    expect(apiMock.updateCarService).toHaveBeenCalledWith(1, 'Sale');
    expect(component.cars()[0].service).toBe('Sale');
    expect(fixture.nativeElement.textContent).toContain('Type de service modifié avec succès.');
  });

  it('should display pagination', () => {
    component.cars.set(
      Array.from({ length: 13 }, (_, index) => ({
        ...cars[0],
        id: index + 1,
      })),
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Précédent');
    expect(fixture.nativeElement.textContent).toContain('1');
    expect(fixture.nativeElement.textContent).toContain('2');
    expect(fixture.nativeElement.textContent).toContain('Suivant');
    expect(fixture.nativeElement.querySelectorAll('.gallery-car-card').length).toBe(12);
  });
});
