import { TestBed } from '@angular/core/testing';

import { Api } from './api';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('Api', () => {
  let service: Api;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Api);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login requests to the user login endpoint with credentials', () => {
    const credentials = {
      email: 'user@test.com',
      password: 'password123',
    };

    service.login(credentials).subscribe((response) => {
      expect(response.status).toBe(200);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/loginEmployee`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    expect(req.request.withCredentials).toBe(true);

    req.flush(null, { status: 200, statusText: 'OK' });
  });

  it('should create cars with form data', () => {
    const formData = new FormData();
    formData.append('brand', 'Genesis');

    service.createCar(formData).subscribe((response) => {
      expect(response.status).toBe(201);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    expect(req.request.withCredentials).toBe(true);

    req.flush(null, { status: 201, statusText: 'Created' });
  });

  it('should fetch all cars', () => {
    service.findAllCars().subscribe((response) => {
      expect(response.body).toEqual([{ id: 1 }]);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush([{ id: 1 }]);
  });

  it('should fetch one car by id', () => {
    service.findOneCar(12).subscribe((response) => {
      expect(response.body).toEqual({ id: 12 });
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/12`);
    expect(req.request.method).toBe('GET');

    req.flush({ id: 12 });
  });

  it('should fetch cars by encoded service', () => {
    service.findCarsByService('Long Term Sale').subscribe((response) => {
      expect(response.body).toEqual([]);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/service/Long%20Term%20Sale`);
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should update a car service with a service query parameter', () => {
    service.updateCarService(12, 'Leasing').subscribe((response) => {
      expect(response.status).toBe(200);
    });

    const req = httpTesting.expectOne((request) => request.url === `${environment.apiUrl}/cars/12/service`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('service')).toBe('Leasing');
    expect(req.request.body).toBeNull();

    req.flush(null, { status: 200, statusText: 'OK' });
  });

  it('should update cars with form data', () => {
    const formData = new FormData();
    formData.append('model', 'GV80');

    service.updateCar(12, formData).subscribe((response) => {
      expect(response.status).toBe(200);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/12`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBe(formData);

    req.flush(null, { status: 200, statusText: 'OK' });
  });

  it('should request a car image as a blob with a body', () => {
    const body = { url: 'https://project.supabase.co/storage/v1/object/public/cars/genesis-gv80.jpg' };
    const blob = new Blob(['image']);

    service.getCarImage(12, body).subscribe((response) => {
      expect(response.body).toBe(blob);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/12/image`);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toEqual(body);
    expect(req.request.responseType).toBe('blob');

    req.flush(blob);
  });

  it('should delete a car image with a url body', () => {
    const body = { url: 'cars/genesis-gv80.jpg' };

    service.deleteCarImage(12, body).subscribe((response) => {
      expect(response.status).toBe(200);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/12/image`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(body);

    req.flush(null, { status: 200, statusText: 'OK' });
  });

  it('should delete a car by id', () => {
    service.deleteCar(12).subscribe((response) => {
      expect(response.status).toBe(204);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cars/12`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
