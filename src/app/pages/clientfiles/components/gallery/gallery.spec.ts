import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Api } from '../../../../services/api';

import { Gallery } from './gallery';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let apiMock: any;
  const clientfiles = [
    { id: 1, status: 'Accepted', car: { brand: 'Genesis', model: 'GV80' }, user: { id: 1, surname: 'Doe', name: 'Jane' } },
    { id: 2, status: 'Pending', car: { brand: 'Genesis', model: 'GV80' }, user: { id: 2, surname: 'Doe', name: 'John' } },
  ];

  beforeEach(async () => {
    apiMock = {
      findAllClientfiles: vi.fn().mockReturnValue(of({ body: [] })),
      deleteClientfile: vi.fn(),
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client files from an array response body', () => {
    apiMock.findAllClientfiles.mockReturnValue(of({ body: clientfiles }));

    component.ngOnInit();

    expect(component.clientfiles()).toEqual(clientfiles);
  });

  it('should keep an empty client files list when the response body is not an array', () => {
    apiMock.findAllClientfiles.mockReturnValue(of({ body: {} }));

    component.ngOnInit();

    expect(component.clientfiles()).toEqual([]);
  });

  it('should keep an empty client files list when loading client files fails', () => {
    apiMock.findAllClientfiles.mockReturnValue(throwError(() => new Error('')));

    component.ngOnInit();

    expect(component.clientfiles()).toEqual([]);
  });

  it('should return display labels for known statuses', () => {
    expect(component.getStatusLabel('Pending')).toBe('En cours de traitement');
    expect(component.getStatusLabel('Accepted')).toBe('Accepté');
    expect(component.getStatusLabel('Rejected')).toBe('Rejeté');
    expect(component.getStatusLabel('Canceled')).toBe('Annulé');
  });

  it('should return bootstrap classes for known statuses', () => {
    expect(component.getStatusClass('Accepted')).toBe('text-bg-success');
    expect(component.getStatusClass('Rejected')).toBe('text-bg-danger');
    expect(component.getStatusClass('Canceled')).toBe('text-bg-secondary');
    expect(component.getStatusClass('Pending')).toBe('bg-light');
  });

  it('should filter client files by selected status', () => {
    component.clientfiles.set(clientfiles);
    component.selectedStatus.set('Accepted');

    expect(component.filteredClientfiles()).toEqual([clientfiles[0]]);
  });

  it('should open and close the delete modal state', () => {
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;

    component.openDeleteModal(event, clientfiles[0]);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.clientfileToDelete()).toBe(clientfiles[0]);

    component.closeDeleteModal();
    expect(component.clientfileToDelete()).toBeNull();
  });

  it('should delete a selected client file', () => {
    vi.useFakeTimers();
    apiMock.deleteClientfile.mockReturnValue(of({ status: 200 }));
    component.clientfiles.set(clientfiles);
    component.clientfileToDelete.set(clientfiles[0]);

    component.deleteSelectedClientfile();

    expect(apiMock.deleteClientfile).toHaveBeenCalledWith(1);
    expect(component.clientfiles()).toEqual([clientfiles[1]]);
    expect(component.clientfileToDelete()).toBeNull();
    expect(component.deleteSuccessMessage()).toBe('Dossier client supprimé avec succès.');

    vi.advanceTimersByTime(2500);
    expect(component.deleteSuccessMessage()).toBe('');
  });

  it('should not delete without a selected client file id', () => {
    component.clientfileToDelete.set({});

    component.deleteSelectedClientfile();

    expect(apiMock.deleteClientfile).not.toHaveBeenCalled();
  });
});
