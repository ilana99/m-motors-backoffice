import { TestBed } from '@angular/core/testing';
import { Api } from './api';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('Api', () => {
  let service: Api;
  let httpTesting: HttpTestingController;
  const apiUrl = environment.apiUrl;

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


  it('should login a user', () => {
    const credentials = {
      email: 'user@gmail.com',
      password: 'password123',
    };

    service.login(credentials).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/auth/loginEmployee`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get the current user', () => {
    service.me().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/auth/meEmployee`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get the user profile', () => {
    service.getProfile().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/user/profile`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });


  it('should get one client file', () => {
    service.findOneClientfile(1).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/clientfile/1`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should logout a user', () => {
    service.logout().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ role: 'employee' });
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get all cars', () => {
    service.findAllCars().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get one car', () => {
    service.findOneCar(1).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1/clientfiles`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should create a car', () => {
    const car = {
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
    };

    service.createCar(car).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(car);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get all client files', () => {
    service.findAllClientfiles().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/clientfile`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get cars by service', () => {
    service.findCarsByService('Sale').subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/service/Sale`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get client files by status', () => {
    service.findClientfileByStatus('Pending').subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/clientfile/status/Pending`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should update a car service', () => {
    service.updateCarService(1, 'Sale').subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1/service?service=Sale`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeNull();
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should update a car', () => {
    const car = {
      brand: 'Genesis',
      model: 'GV80',
      price: 42000,
      service: 'Sale',
    };

    service.updateCar(1, car).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(car);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should update a client file status', () => {
    service.updateClientfileStatus(1, 'Accepted').subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/clientfile/1/status?status=Accepted`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeNull();
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should get a car image', () => {
    const body = { url: 'genesis-gv80-front.jpg' };

    service.getCarImage(1, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1/image`);
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toEqual(body);
    expect(request.request.responseType).toBe('blob');
    expect(request.request.withCredentials).toBe(true);
    request.flush(new Blob());
  });

  it('should delete a car image', () => {
    const body = { url: 'genesis-gv80-front.jpg' };

    service.deleteCarImage(1, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1/image`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(body);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should delete a car', () => {
    service.deleteCar(1).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/cars/1`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('should delete a client file', () => {
    service.deleteClientfile(1).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/clientfile/1`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

});
