import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Api } from '../../services/api';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let apiMock: any;

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

  it('should show the first three cars and client files', () => {
    const cars = [
      { id: 1, brand: 'Genesis', model: 'GV80' },
      { id: 2, brand: 'Genesis', model: 'GV80' },
      { id: 3, brand: 'Genesis', model: 'GV80' },
      { id: 4, brand: 'Genesis', model: 'GV80' },
    ];
    const clientfiles = [
      { id: 1, status: 'Pending', car: { brand: 'Genesis', model: 'GV80' }, user: {} },
      { id: 2, status: 'Pending', car: { brand: 'Genesis', model: 'GV80' }, user: {} },
      { id: 3, status: 'Pending', car: { brand: 'Genesis', model: 'GV80' }, user: {} },
      { id: 4, status: 'Pending', car: { brand: 'Genesis', model: 'GV80' }, user: {} },
    ];

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
});
