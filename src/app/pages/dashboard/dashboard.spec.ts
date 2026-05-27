import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Api } from '../../services/api';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let apiMock: any;
  const storageUrl = 'https://project.supabase.co/storage/v1/object/public/cars';
  const cars = [
    {
      id: 1,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Leasing',
      images: [`${storageUrl}/genesis-gv80-front.jpg`],
    },
    {
      id: 2,
      brand: 'Genesis',
      model: 'GV80',
      price: 39000,
      service: 'Sale',
      images: [],
    },
    {
      id: 3,
      brand: 'Genesis',
      model: 'GV80',
      price: 45000,
      service: 'Sale',
      images: [`${storageUrl}/genesis-gv80-side.jpg`],
    },
    {
      id: 4,
      brand: 'Genesis',
      model: 'GV80',
      price: 47000,
      service: 'Leasing',
      images: [],
    },
  ];
  const clientfiles = [
    {
      id: 1,
      status: 'Pending',
      car: { id: 1, brand: 'Genesis', model: 'GV80' },
      user: { id: 1, surname: 'Marie', name: 'Maria' },
    },
    {
      id: 2,
      status: 'Accepted',
      car: { id: 2, brand: 'Genesis', model: 'GV80' },
      user: { id: 2, surname: 'Marie', name: 'Maria' },
    },
    {
      id: 3,
      status: 'Canceled',
      car: { id: 3, brand: 'Genesis', model: 'GV80' },
      user: { id: 3, surname: 'Marie', name: 'Maria' },
    },
    {
      id: 4,
      status: 'Rejected',
      car: { id: 4, brand: 'Genesis', model: 'GV80' },
      user: { id: 4, surname: 'Marie', name: 'Maria' },
    },
  ];

  beforeEach(async () => {
    apiMock = {
      findAllCars: vi.fn().mockReturnValue(of({ body: [] })),
      findAllClientfiles: vi.fn().mockReturnValue(of({ body: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: Api, useValue: apiMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cars and client files from array response bodies', () => {
    apiMock.findAllCars.mockReturnValue(of({ body: cars }));
    apiMock.findAllClientfiles.mockReturnValue(of({ body: clientfiles }));

    component.ngOnInit();

    expect(component.cars()).toEqual(cars);
    expect(component.clientfiles()).toEqual(clientfiles);
  });

  it('should keep empty lists when response bodies are not arrays', () => {
    apiMock.findAllCars.mockReturnValue(of({ body: {} }));
    apiMock.findAllClientfiles.mockReturnValue(of({ body: {} }));

    component.ngOnInit();

    expect(component.cars()).toEqual([]);
    expect(component.clientfiles()).toEqual([]);
  });

  it('should keep empty lists when loading data fails', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    apiMock.findAllCars.mockReturnValue(throwError(() => new Error('')));
    apiMock.findAllClientfiles.mockReturnValue(throwError(() => new Error('')));

    component.ngOnInit();

    expect(component.cars()).toEqual([]);
    expect(component.clientfiles()).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should show the first three cars and client files', () => {
    component.cars.set(cars);
    component.clientfiles.set(clientfiles);

    expect(component.firstCars()).toEqual(cars.slice(0, 3));
    expect(component.firstClientfiles()).toEqual(clientfiles.slice(0, 3));
  });

  it('should return labels and classes for known statuses', () => {
    expect(component.getStatusLabel('Pending')).toBe('En cours de traitement');
    expect(component.getStatusLabel('Accepted')).toBe('Accepté');
    expect(component.getStatusClass('Accepted')).toBe('text-bg-success');
    expect(component.getStatusClass('Rejected')).toBe('text-bg-secondary');
    expect(component.getStatusClass('Canceled')).toBe('text-bg-secondary');
  });

  it('should return display labels for known services', () => {
    expect(component.getServiceLabel('Leasing')).toBe('Location');
    expect(component.getServiceLabel('Sale')).toBe('Vente');
  });

  it('should display dashboard cars and client files', () => {
    component.cars.set(cars);
    component.clientfiles.set(clientfiles);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Stock actuel');
    expect(fixture.nativeElement.textContent).toContain('Dossiers clients');
    expect(fixture.nativeElement.textContent).toContain('Location');
    expect(fixture.nativeElement.textContent).toContain('Vente');
    expect(fixture.nativeElement.textContent).toContain('Genesis');
    expect(fixture.nativeElement.textContent).toContain('GV80');
    expect(fixture.nativeElement.textContent).toContain('42000');
    expect(fixture.nativeElement.textContent).toContain('39000');
    expect(fixture.nativeElement.textContent).toContain('Dossier client');
    expect(fixture.nativeElement.textContent).toContain('En cours de traitement');
    expect(fixture.nativeElement.textContent).toContain('Marie Maria');
    expect(fixture.nativeElement.textContent).toContain('Voir et gérer tout le stock');
    expect(fixture.nativeElement.textContent).toContain('Voir et gérer tous les dossiers');
  });

  it('should display only the first three cars and client files', () => {
    component.cars.set(cars);
    component.clientfiles.set(clientfiles);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ID: 1');
    expect(fixture.nativeElement.textContent).toContain('ID: 2');
    expect(fixture.nativeElement.textContent).toContain('ID: 3');
    expect(fixture.nativeElement.textContent).not.toContain('ID: 4');
  });

  it('should display car images and placeholders', () => {
    component.cars.set(cars);

    fixture.detectChanges();

    const images = fixture.nativeElement.querySelectorAll('.dashboard-car-image');

    expect(images[0].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-front.jpg`);
    expect(images[0].getAttribute('alt')).toBe('Genesis GV80');
    expect(images[1].getAttribute('src')).toBe('/car.jpg');
    expect(images[1].getAttribute('alt')).toBe('car placeholder');
  });

  it('should display empty messages when there are no cars or client files', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune voiture trouvée.');
    expect(fixture.nativeElement.textContent).toContain('Aucun dossier client trouvé.');
  });
});
