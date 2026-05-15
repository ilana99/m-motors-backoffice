import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Form } from './form';

describe('Form', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;
  const storageUrl = 'https://project.supabase.co/storage/v1/object/public/cars';

  beforeEach(async () => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [Form],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the form and existing images when editing a car', () => {
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: [`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`],
    });

    expect(component.existingImages()).toEqual([`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`]);
    expect(component.carId()).toBe(12);
    expect(component.carsForm.getRawValue()).toEqual({
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
    });
  });

  it('should disable the service field when editing an unavailable car', () => {
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      isAvailable: false,
      images: [],
    });

    const serviceSelect = fixture.nativeElement.querySelector('#carService') as HTMLSelectElement;

    expect(component.carsForm.controls.service.disabled).toBe(true);
    expect(serviceSelect.disabled).toBe(true);
  });

  it('should limit selected files to the remaining slots under 10 total images', () => {
    setCarInput({
      id: 12,
      images: Array.from({ length: 8 }, (_, index) => `${storageUrl}/genesis-gv80-${index}.jpg`),
    });
    const files = [
      new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' }),
      new File(['side'], 'genesis-gv80-side.jpg', { type: 'image/jpeg' }),
      new File(['interior'], 'genesis-gv80-interior.jpg', { type: 'image/jpeg' }),
    ];

    component.updateImages({ target: { files } } as unknown as Event);

    expect(component.selectedFiles().map(({ file }) => file.name)).toEqual(['genesis-gv80-front.jpg', 'genesis-gv80-side.jpg']);
    expect(component.hasTooManyImages()).toBe(true);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
  });

  it('should clear the image limit error when a later selection fits', () => {
    setCarInput({
      id: 12,
      images: Array.from({ length: 8 }, (_, index) => `${storageUrl}/genesis-gv80-${index}.jpg`),
    });
    const files = [
      new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' }),
      new File(['side'], 'genesis-gv80-side.jpg', { type: 'image/jpeg' }),
      new File(['interior'], 'genesis-gv80-interior.jpg', { type: 'image/jpeg' }),
    ];

    component.updateImages({ target: { files } } as unknown as Event);
    component.updateImages({ target: { files: files.slice(0, 2) } } as unknown as Event);

    expect(component.hasTooManyImages()).toBe(false);
    expect(component.selectedFiles().map(({ file }) => file.name)).toEqual(['genesis-gv80-front.jpg', 'genesis-gv80-side.jpg']);
  });

  it('should revoke a selected image URL when removing it', () => {
    const files = [
      new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' }),
      new File(['side'], 'genesis-gv80-side.jpg', { type: 'image/jpeg' }),
    ];
    createObjectURLSpy.mockReturnValueOnce('blob:genesis-gv80-front').mockReturnValueOnce('blob:genesis-gv80-side');
    component.updateImages({ target: { files } } as unknown as Event);

    component.removeImageFromBrowser(0);

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:genesis-gv80-front');
    expect(component.selectedFiles().map(({ file }) => file.name)).toEqual(['genesis-gv80-side.jpg']);
    expect(component.hasTooManyImages()).toBe(false);
  });

  it('should queue an existing image delete without calling the API immediately', () => {
    setCarInput({
      id: 12,
      images: [`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`],
    });

    component.deleteExistingImage(`${storageUrl}/genesis-gv80-front.jpg`);
    component.deleteExistingImage(`${storageUrl}/genesis-gv80-front.jpg`);

    expect(component.existingImages()).toEqual([`${storageUrl}/genesis-gv80-side.jpg`]);
    expect(component.deletedImageUrls()).toEqual([`${storageUrl}/genesis-gv80-front.jpg`]);
  });

  it('should not emit submit data when the form is invalid', () => {
    const emitSpy = vi.spyOn(component.carSubmit, 'emit');

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.carsForm.controls.brand.touched).toBe(true);
  });

  it('should emit form data and queued deleted image URLs when the form is valid', () => {
    const emitSpy = vi.spyOn(component.carSubmit, 'emit');
    const file = new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' });
    setCarInput({
      id: 12,
      images: [`${storageUrl}/genesis-gv80.jpg`],
    });
    component.deleteExistingImage(`${storageUrl}/genesis-gv80.jpg`);
    component.updateImages({ target: { files: [file] } } as unknown as Event);
    component.carsForm.patchValue({
      brand: 'Genesis',
      model: 'GV80',
      price: '42000',
      service: 'Sale',
    });

    component.submit();

    const submission = emitSpy.mock.calls[0][0]!;
    expect(submission.deletedImageUrls).toEqual([`${storageUrl}/genesis-gv80.jpg`]);
    expect(submission.formData.get('brand')).toBe('Genesis');
    expect(submission.formData.get('model')).toBe('GV80');
    expect(submission.formData.get('price')).toBe('42000');
    expect(submission.formData.get('service')).toBe('Sale');
    expect(submission.formData.has('id')).toBe(false);
    expect((submission.formData.get('images') as File).name).toBe(file.name);
  });

  function setCarInput(car: any | null): void {
    fixture.componentRef.setInput('car', car);
    fixture.detectChanges();
  }
});
