import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    observe: 'response' as const,
    withCredentials: true,
  };

  constructor(private Http: HttpClient) { }

  login(data: any): Observable<HttpResponse<any>> {
    return this.Http.post<any>(`${this.apiUrl}/auth/loginEmployee`, data, this.httpOptions);
  }

  me(): Observable<HttpResponse<any>> {
    return this.Http.get<any>(`${this.apiUrl}/auth/me`, this.httpOptions);
  }

  logout(): Observable<HttpResponse<any>> {
    return this.Http.post<any>(`${this.apiUrl}/auth/logout`, {}, this.httpOptions);
  }
}
