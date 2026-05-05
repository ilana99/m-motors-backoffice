import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render delete mode by default', () => {
    component.car = {
      id: 1,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: ['https://project.supabase.co/storage/v1/object/public/cars/genesis-gv80.jpg'],
    };
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Supprimer la voiture');
    expect(text).toContain('Voulez-vous vraiment supprimer cette voiture?');
    expect(text).toContain('Genesis GV80');
  });

  it('should render service mode', () => {
    component.mode = 'serviceChange';
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Changer le service de la voiture');
    expect(text).toContain('Voulez-vous vraiment changer le type de service de cette voiture?');
  });

  it('should render a success message without buttons', () => {
    component.successMessage = 'Action réussie.';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Action réussie.');
    expect(fixture.nativeElement.querySelector('.modal-footer')).toBeNull();
  });

  it('should emit close when clicking the close button', () => {
    const emitSpy = vi.spyOn(component.closeModal, 'emit');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-close').click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit confirmDelete in delete mode', () => {
    const emitSpy = vi.spyOn(component.confirmDelete, 'emit');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-danger').click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit confirmServiceChange in service mode', () => {
    const emitSpy = vi.spyOn(component.confirmServiceChange, 'emit');
    component.mode = 'serviceChange';
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.modal-footer .btn-primary').click();

    expect(emitSpy).toHaveBeenCalled();
  });
});
