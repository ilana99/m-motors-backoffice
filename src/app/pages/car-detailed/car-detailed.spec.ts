import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api } from '../../services/api';

import { CarDetailed } from './car-detailed';

describe('CarDetailed', () => {
  let component: CarDetailed;
  let fixture: ComponentFixture<CarDetailed>;
  let apiMock: any;

  beforeEach(async () => {
    apiMock = {
      findOneCar: () => of({
        body: {
          id: 1,
          brand: 'Genesis',
          model: 'GV80',
          service: 'Sale',
          isAvailable: true,
          images: [],
          clientFiles: [
            {
              id: 41,
              userId: 42,
              name: 'Maria',
              surname: 'Marie',
              status: 'Rejected',
            },
          ],
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CarDetailed],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetailed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
