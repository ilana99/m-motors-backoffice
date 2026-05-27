import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Api } from '../../../../services/api';
import { Modal } from '../modal/modal';

import { Gallery } from './gallery';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let apiMock: any;
  const clientfiles = [
    { id: 1, status: 'Accepted', car: { id: 1, brand: 'Genesis', model: 'GV80' }, user: { id: 1, surname: 'Marie', name: 'Maria' } },
    { id: 2, status: 'Pending', car: { id: 2, brand: 'Genesis', model: 'GV80' }, user: { id: 2, surname: 'Marie', name: 'Maria' } },
    { id: 3, status: 'Canceled', car: { id: 3, brand: 'Genesis', model: 'GV80' }, user: { id: 3, surname: 'Marie', name: 'Maria' } },
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
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    apiMock.findAllClientfiles.mockReturnValue(throwError(() => new Error('')));

    component.ngOnInit();

    expect(component.clientfiles()).toEqual([]);

    consoleSpy.mockRestore();
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

  it('should show all client files when no status is selected', () => {
    component.clientfiles.set(clientfiles);
    component.changeStatus('');

    expect(component.filteredClientfiles()).toEqual(clientfiles);
  });

  it('should change selected status', () => {
    component.changeStatus('Pending');

    expect(component.selectedStatus()).toBe('Pending');
  });

  it('should split pending and past client files', () => {
    component.clientfiles.set(clientfiles);

    expect(component.getPendingClientfiles()).toEqual([clientfiles[1]]);
    expect(component.getPastClientfiles()).toEqual([clientfiles[0], clientfiles[2]]);
  });

  it('should not show the past client files section when filtering pending client files', () => {
    component.clientfiles.set(clientfiles);
    component.selectedStatus.set('Pending');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dossiers en cours');
    expect(fixture.nativeElement.textContent).not.toContain('Dossiers passés');
  });

  it('should display client files', () => {
    component.clientfiles.set(clientfiles);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tous les statuts');
    expect(fixture.nativeElement.textContent).toContain('Dossiers en cours');
    expect(fixture.nativeElement.textContent).toContain('Dossiers passés');
    expect(fixture.nativeElement.textContent).toContain('Dossier client');
    expect(fixture.nativeElement.textContent).toContain('En cours de traitement');
    expect(fixture.nativeElement.textContent).toContain('Accepté');
    expect(fixture.nativeElement.textContent).toContain('Annulé');
    expect(fixture.nativeElement.textContent).toContain('Genesis GV80');
    expect(fixture.nativeElement.textContent).toContain('Marie Maria');
  });

  it('should display the delete success alert', () => {
    component.deleteSuccessMessage.set('Dossier client supprimé avec succès.');

    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-success');

    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain('Dossier client supprimé avec succès.');
  });

  it('should display past client file details and delete actions', () => {
    component.clientfiles.set([clientfiles[0], clientfiles[2]]);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.clientfile-card');
    const deleteButtons = fixture.nativeElement.querySelectorAll('[aria-label="Supprimer ce dossier client"]');

    expect(fixture.nativeElement.textContent).toContain('Dossiers passés');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('ID: 1');
    expect(cards[0].textContent).toContain('Genesis GV80');
    expect(cards[0].textContent).toContain('Marie Maria');
    expect(cards[1].textContent).toContain('ID: 3');
    expect(deleteButtons.length).toBe(2);
  });

  it('should display one card for each client file', () => {
    component.clientfiles.set(clientfiles);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.clientfile-card');

    expect(cards.length).toBe(3);
  });

  it('should update displayed client files when selecting a status', () => {
    component.clientfiles.set(clientfiles);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'Accepted';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.clientfile-card');

    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Accepté');
    expect(cards[0].textContent).not.toContain('En cours de traitement');
    expect(fixture.nativeElement.textContent).not.toContain('Dossiers en cours');
  });

  it('should display no sections when there are no client files', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tous les statuts');
    expect(fixture.nativeElement.textContent).not.toContain('Dossiers en cours');
    expect(fixture.nativeElement.textContent).not.toContain('Dossiers passés');
    expect(fixture.nativeElement.querySelector('.clientfile-card')).toBeNull();
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

  it('should open the delete modal from the delete button', () => {
    component.clientfiles.set(clientfiles);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[aria-label="Supprimer ce dossier client"]') as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(component.clientfileToDelete()).toBe(clientfiles[1]);
    expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();
  });

  it('should close the delete modal from the modal output', () => {
    component.clientfileToDelete.set(clientfiles[0]);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.closeModal.emit();
    fixture.detectChanges();

    expect(component.clientfileToDelete()).toBeNull();
    expect(fixture.nativeElement.querySelector('app-modal')).toBeNull();
  });

  it('should delete the selected client file from the modal output', () => {
    vi.useFakeTimers();
    apiMock.deleteClientfile.mockReturnValue(of({ status: 200 }));
    component.clientfiles.set(clientfiles);
    component.clientfileToDelete.set(clientfiles[0]);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;
    modal.confirmDelete.emit();
    fixture.detectChanges();

    expect(apiMock.deleteClientfile).toHaveBeenCalledWith(1);
    expect(component.clientfiles()).toEqual([clientfiles[1], clientfiles[2]]);
    expect(fixture.nativeElement.textContent).toContain('Dossier client supprimé avec succès.');
  });

  it('should delete a selected client file', () => {
    vi.useFakeTimers();
    apiMock.deleteClientfile.mockReturnValue(of({ status: 200 }));
    component.clientfiles.set(clientfiles);
    component.clientfileToDelete.set(clientfiles[0]);

    component.deleteSelectedClientfile();

    expect(apiMock.deleteClientfile).toHaveBeenCalledWith(1);
    expect(component.clientfiles()).toEqual([clientfiles[1], clientfiles[2]]);
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

  it('should keep the selected client file when deleting fails', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = new Error('');
    apiMock.deleteClientfile.mockReturnValue(throwError(() => error));
    component.clientfiles.set(clientfiles);
    component.clientfileToDelete.set(clientfiles[0]);

    component.deleteSelectedClientfile();

    expect(component.clientfiles()).toEqual(clientfiles);
    expect(component.clientfileToDelete()).toBe(clientfiles[0]);
    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });

  it('should clear the delete success timeout on destroy', () => {
    vi.useFakeTimers();
    apiMock.deleteClientfile.mockReturnValue(of({ status: 200 }));
    component.clientfiles.set(clientfiles);
    component.clientfileToDelete.set(clientfiles[0]);
    component.deleteSelectedClientfile();

    component.ngOnDestroy();
    vi.advanceTimersByTime(2500);

    expect(component.deleteSuccessMessage()).toBe('Dossier client supprimé avec succès.');
  });
});
