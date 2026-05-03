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
});
