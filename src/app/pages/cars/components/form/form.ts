import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export type CarsFormMode = 'create' | 'edit';
export type CarsFormSubmit = {
  formData: FormData;
  deletedImageUrls: string[];
};
type SelectedFile = {
  file: File;
  url: string;
};

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnChanges, OnDestroy {
  @ViewChild('carImagesInput') private carImagesInput?: ElementRef<HTMLInputElement>;

  @Input() mode: CarsFormMode = 'create';
  @Input() car: any | null = null;

  @Output() carSubmit = new EventEmitter<CarsFormSubmit>();
  @Output() closeForm = new EventEmitter<void>();

  existingImages = signal<string[]>([]);
  deletedImageUrls = signal<string[]>([]);
  carsForm = new FormGroup({
    brand: new FormControl('', [Validators.required]),
    model: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(0)]),
    service: new FormControl('', [Validators.required]),
  });
  hasTooManyImages = signal(false);

  selectedFiles = signal<SelectedFile[]>([]);
  carId = signal<number | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['car']) {
      this.loadCarForEditing(this.car);
    }
  }

  ngOnDestroy(): void {
    this.clearSelectedFiles();
  }

  private loadCarForEditing(car: any | null): void {
    if (!car) {
      this.carsForm.reset();
      this.carId.set(null);
      this.existingImages.set([]);
      this.deletedImageUrls.set([]);
      return;
    }

    this.carId.set(car.id ?? null);
    this.existingImages.set(Array.isArray(car.images) ? car.images : []);
    this.deletedImageUrls.set([]);
    this.carsForm.patchValue({
      brand: car.brand ?? '',
      model: car.model ?? '',
      price: car.price ?? '',
      service: car.service ?? '',
    });
  }

  shouldShowError(controlName: 'brand' | 'model' | 'price' | 'service'): boolean {
    const control = this.carsForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  updateImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const remainingImageSlots = Math.max(0, 10 - this.existingImages().length);
    const files = Array.from(input.files ?? []);

    this.hasTooManyImages.set(files.length > remainingImageSlots);

    this.clearSelectedFiles(false);
    this.selectedFiles.set(
      files.slice(0, remainingImageSlots).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    );
    this.syncFileInputWithSelectedFiles();
  }

  removeImageFromBrowser(index: number): void {
    const selectedFiles = this.selectedFiles();
    URL.revokeObjectURL(selectedFiles[index].url);
    this.selectedFiles.set(selectedFiles.filter((_, fileIndex) => fileIndex !== index));
    this.hasTooManyImages.set(false);
    this.syncFileInputWithSelectedFiles();
  }

  deleteExistingImage(image: string): void {
    if (this.carId() === null) {
      return;
    }

    this.existingImages.update((images) => images.filter((existingImage) => existingImage !== image));
    this.deletedImageUrls.update((images) => images.includes(image) ? images : [...images, image]);
  }

  submit(): void {
    if (this.carsForm.invalid) {
      this.carsForm.markAllAsTouched();
      return;
    }

    const value = this.carsForm.getRawValue();
    const formData = new FormData();

    formData.append('brand', value.brand ?? '');
    formData.append('model', value.model ?? '');
    formData.append('price', value.price ?? '');
    formData.append('service', value.service ?? '');
    this.selectedFiles().forEach(({ file }) => formData.append('images', file, file.name));

    this.carSubmit.emit({
      formData,
      deletedImageUrls: this.deletedImageUrls(),
    });
  }

  private clearSelectedFiles(resetInput = true): void {
    this.selectedFiles().forEach(({ url }) => URL.revokeObjectURL(url));
    this.selectedFiles.set([]);

    if (resetInput) {
      this.clearFileInput();
    }
  }

  private syncFileInputWithSelectedFiles(): void {
    const input = this.carImagesInput?.nativeElement;

    if (!input) {
      return;
    }

    const selectedFiles = this.selectedFiles();

    if (!selectedFiles.length || typeof DataTransfer === 'undefined') {
      input.value = '';
      return;
    }

    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(({ file }) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  }

  private clearFileInput(): void {
    const input = this.carImagesInput?.nativeElement;

    if (input) {
      input.value = '';
    }
  }

}
