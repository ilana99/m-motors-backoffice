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

  it('should render delete mode', () => {
    component.clientfile = { id: 1 };
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Supprimer le dossier client');
    expect(text).toContain('Voulez-vous vraiment supprimer ce dossier client?');
    expect(text).toContain('Dossier client #1');
  });

  it('should emit close when clicking the close button', () => {
    const emitSpy = vi.spyOn(component.closeModal, 'emit');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-close').click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit confirmDelete', () => {
    const emitSpy = vi.spyOn(component.confirmDelete, 'emit');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-danger').click();

    expect(emitSpy).toHaveBeenCalled();
  });
});
