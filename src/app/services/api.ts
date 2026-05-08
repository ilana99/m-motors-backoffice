import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = environment.apiUrl;

  private get httpOptions() {
    return {
      observe: 'response' as const,
      withCredentials: true,
    };
  }

  constructor(private Http: HttpClient) { }

  login(data: any): Observable<HttpResponse<any>> {
    return this.Http.post<any>(`${this.apiUrl}/auth/loginEmployee`, data, this.httpOptions);
  }

  getProfile(): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/user/profile`, this.httpOptions);
  }


  createCar(data: any): Observable<HttpResponse<any>> {
    return this.Http.post<any>(`${this.apiUrl}/cars`, data, this.httpOptions);
  }

  findAllCars(): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/cars`, this.httpOptions);
  }

  findAllClientfiles(): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/clientfile`, this.httpOptions);
  }

  findOneCar(id: number): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/cars/${id}`, this.httpOptions);
  }

  findOneClientfile(id: number): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/clientfile/${id}`, this.httpOptions);
  }

  findCarsByService(service: string): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/cars/service/${encodeURIComponent(service)}`, this.httpOptions);
  }

  findClientfileByStatus(status: string): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/clientfile/status/${encodeURIComponent(status)}`, this.httpOptions);
  }

  updateCarService(id: number, service: string): Observable<HttpResponse<any>> {
    const params = new HttpParams().set('service', service);

    return this.Http.patch<any>(`${this.apiUrl}/cars/${id}/service`, null, {
      ...this.httpOptions,
      params,
    });
  }

  updateCar(id: number, data: any): Observable<HttpResponse<any>> {
    return this.Http.patch<any>(`${this.apiUrl}/cars/${id}`, data, this.httpOptions);
  }

  updateClientfileStatus(id: number, status: string): Observable<HttpResponse<any>> {
    const params = new HttpParams().set('status', status);

    return this.Http.patch<any>(`${this.apiUrl}/clientfile/${id}/status`, null, {
      ...this.httpOptions,
      params,
    });
  }

  getCarImage(id: number, data: any): Observable<HttpResponse<Blob>> {
    return this.Http.request('GET', `${this.apiUrl}/cars/${id}/image`, {
      ...this.httpOptions,
      body: data,
      responseType: 'blob',
    });
  }

  deleteCarImage(id: number, data: any): Observable<HttpResponse<any>> {
    return this.Http.delete<any>(`${this.apiUrl}/cars/${id}/image`, {
      ...this.httpOptions,
      body: data,
    });
  }

  deleteCar(id: number): Observable<HttpResponse<any>> {
    return this.Http.delete<any>(`${this.apiUrl}/cars/${id}`, this.httpOptions);
  }

  deleteClientfile(id: number): Observable<HttpResponse<any>> {
    return this.Http.delete<any>(`${this.apiUrl}/clientfile/${id}`, this.httpOptions);
  }

  me(): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/auth/me`, this.httpOptions);
  }

  logout(): Observable<HttpResponse<any>> {
    return this.Http.post<any>(`${this.apiUrl}/auth/logout`, {}, this.httpOptions);
  }
}
