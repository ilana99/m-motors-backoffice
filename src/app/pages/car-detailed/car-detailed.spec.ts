import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api } from '../../services/api';
import { CarDetailed } from './car-detailed';

describe('CarDetailed', () => {
  let component: CarDetailed;
  let fixture: ComponentFixture<CarDetailed>;
  let apiMock: any;
  const storageUrl = 'https://project.supabase.co/storage/v1/object/public/cars';
  const car = {
    id: 1,
    brand: 'Genesis',
    model: 'GV80',
    price: 42000,
    service: 'Leasing',
    isAvailable: true,
    images: [`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`],
    clientFiles: [
      {
        id: 41,
        userId: 42,
        name: 'Maria',
        surname: 'Marie',
        status: 'Rejected',
      },
    ],
  };

  beforeEach(async () => {
    apiMock = {
      findOneCar: vi.fn().mockReturnValue(of({
        body: car,
      })),
    };

    await TestBed.configureTestingModule({
      imports: [CarDetailed],
      providers: [
        provideRouter([]),
        { provide: Api, useValue: apiMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetailed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the car on init', () => {
    component.ngOnInit();

    expect(apiMock.findOneCar).toHaveBeenCalledWith(1);
    expect(component.car()).toEqual(car);
  });

  it('should display the car details', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Location');
    expect(fixture.nativeElement.textContent).toContain('Genesis');
    expect(fixture.nativeElement.textContent).toContain('GV80');
    expect(fixture.nativeElement.textContent).toContain('À partir de 42000 € / mois');
    expect(fixture.nativeElement.textContent).toContain('Disponible');
    expect(fixture.nativeElement.textContent).toContain('Dossiers');
    expect(fixture.nativeElement.textContent).toContain('Dossier client');
    expect(fixture.nativeElement.textContent).toContain('Marie Maria');
  });

  it('should display car images and gallery', () => {
    fixture.detectChanges();

    const images = fixture.nativeElement.querySelectorAll('img');

    expect(fixture.nativeElement.textContent).toContain('Gallerie');
    expect(images[0].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-front.jpg`);
    expect(images[0].getAttribute('alt')).toBe('Genesis GV80');
    expect(images[1].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-front.jpg`);
    expect(images[1].getAttribute('alt')).toBe('Genesis GV80');
    expect(images[2].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-side.jpg`);
    expect(images[2].getAttribute('alt')).toBe('Genesis GV80');
  });

  it('should display a placeholder image when the car has no image', () => {
    component.car.set({
      ...car,
      images: [],
    });

    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('car.jpg');
    expect(image.getAttribute('alt')).toBe('car placeholder');
    expect(fixture.nativeElement.textContent).not.toContain('Gallerie');
  });

  it('should display a sale car', () => {
    component.car.set({
      ...car,
      service: 'Sale',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vente');
    expect(fixture.nativeElement.textContent).toContain('42000 €');
    expect(fixture.nativeElement.textContent).not.toContain('À partir de');
  });

  it('should return display labels for availability', () => {
    expect(component.getAvailabilityLabel({ brand: 'Genesis', model: 'GV80', isAvailable: true, service: 'Sale' })).toBe('Disponible');
    expect(component.getAvailabilityLabel({ brand: 'Genesis', model: 'GV80', isAvailable: false, service: 'Sale' })).toBe('Vendue');
    expect(component.getAvailabilityLabel({ brand: 'Genesis', model: 'GV80', isAvailable: false, service: 'Leasing' })).toBe('En location');
  });

  it('should return display labels for statuses', () => {
    expect(component.getStatusLabel('Pending')).toBe('En cours de traitement');
    expect(component.getStatusLabel('Accepted')).toBe('Accepté');
    expect(component.getStatusLabel('Rejected')).toBe('Rejeté');
    expect(component.getStatusLabel('Canceled')).toBe('Annulé');
  });

  it('should return bootstrap classes for statuses', () => {
    expect(component.getStatusClass('Accepted')).toBe('text-bg-success');
    expect(component.getStatusClass('Rejected')).toBe('text-bg-danger');
    expect(component.getStatusClass('Canceled')).toBe('text-bg-secondary');
    expect(component.getStatusClass('Pending')).toBe('bg-light');
  });
});
