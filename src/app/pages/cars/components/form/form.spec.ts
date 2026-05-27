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
    component.car = {};
    await fixture.whenStable();
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the create title by default', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ajouter une voiture');
  });

  it('should display the edit title and car id when editing', () => {
    fixture.componentRef.setInput('mode', 'edit');
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: [],
    });

    const carIdInput = fixture.nativeElement.querySelector('#carId') as HTMLInputElement;

    expect(fixture.nativeElement.textContent).toContain('Modifier une voiture');
    expect(carIdInput.value).toBe('12');
    expect(carIdInput.disabled).toBe(true);
  });

  it('should emit close when clicking the back button', () => {
    const emitSpy = vi.spyOn(component.closeForm, 'emit');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalled();
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

  it('should reset the form and image state when the car is cleared', () => {
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: [`${storageUrl}/genesis-gv80-front.jpg`],
    });

    component.car = null;
    component.ngOnChanges({ car: { currentValue: null } } as any);

    expect(component.carId()).toBeNull();
    expect(component.existingImages()).toEqual([]);
    expect(component.deletedImageUrls()).toEqual([]);
    expect(component.carsForm.getRawValue()).toEqual({
      brand: null,
      model: null,
      price: null,
      service: null,
    });
    expect(component.carsForm.controls.service.enabled).toBe(true);
  });

  it('should use an empty image list when the car images value is not an array', () => {
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: {},
    });

    expect(component.existingImages()).toEqual([]);
  });

  it('should enable the service field when editing an available car', () => {
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      isAvailable: true,
      images: [],
    });

    expect(component.carsForm.controls.service.enabled).toBe(true);
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

  it('should show validation errors after submit marks invalid controls as touched', () => {
    const emitSpy = vi.spyOn(component.carSubmit, 'emit');

    component.submit();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('La marque est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Le modèle est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Le prix est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Le service est obligatoire.');
  });

  it('should show the positive price error when the price is negative', () => {
    component.carsForm.patchValue({
      brand: 'Genesis',
      model: 'GV80',
      price: '-1',
      service: 'Sale',
    });
    component.carsForm.controls.price.markAsTouched();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Le prix doit être positif.');
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

  it('should replace selected files and revoke the previous URLs when selecting new files', () => {
    const firstFile = new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' });
    const secondFile = new File(['side'], 'genesis-gv80-side.jpg', { type: 'image/jpeg' });
    createObjectURLSpy.mockReturnValueOnce('blob:genesis-gv80-front').mockReturnValueOnce('blob:genesis-gv80-side');

    component.updateImages({ target: { files: [firstFile] } } as unknown as Event);
    component.updateImages({ target: { files: [secondFile] } } as unknown as Event);

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:genesis-gv80-front');
    expect(component.selectedFiles().map(({ file }) => file.name)).toEqual(['genesis-gv80-side.jpg']);
  });

  it('should do nothing when deleting an existing image without a car id', () => {
    component.existingImages.set([`${storageUrl}/genesis-gv80-front.jpg`]);

    component.deleteExistingImage(`${storageUrl}/genesis-gv80-front.jpg`);

    expect(component.existingImages()).toEqual([`${storageUrl}/genesis-gv80-front.jpg`]);
    expect(component.deletedImageUrls()).toEqual([]);
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

  it('should render existing images and remove one from the edit view', () => {
    fixture.componentRef.setInput('mode', 'edit');
    setCarInput({
      id: 12,
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
      images: [`${storageUrl}/genesis-gv80-front.jpg`, `${storageUrl}/genesis-gv80-side.jpg`],
    });

    const images = fixture.nativeElement.querySelectorAll('.existing-image');
    expect(images.length).toBe(2);
    expect(images[0].getAttribute('src')).toBe(`${storageUrl}/genesis-gv80-front.jpg`);

    const deleteButton = fixture.nativeElement.querySelector("[aria-label=\"Supprimer l'image existante\"]") as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

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

  it('should revoke selected image URLs on destroy', () => {
    const files = [
      new File(['front'], 'genesis-gv80-front.jpg', { type: 'image/jpeg' }),
      new File(['side'], 'genesis-gv80-side.jpg', { type: 'image/jpeg' }),
    ];
    createObjectURLSpy.mockReturnValueOnce('blob:genesis-gv80-front').mockReturnValueOnce('blob:genesis-gv80-side');
    component.updateImages({ target: { files } } as unknown as Event);

    component.ngOnDestroy();

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:genesis-gv80-front');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:genesis-gv80-side');
    expect(component.selectedFiles()).toEqual([]);
  });

  function setCarInput(car: any | null): void {
    fixture.componentRef.setInput('car', car);
    fixture.detectChanges();
  }
});
