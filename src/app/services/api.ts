import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'https://m-motors-lpop.onrender.com';

  constructor(private Http: HttpClient) {}
  
   login(data: any): Observable<any> {
    return this.Http.post<any>(`${this.apiUrl}/auth/login`, data, {observe: 'response'});
  }

  signup(data: any): Observable<any> {
    return this.Http.post<any>(`${this.apiUrl}/auth/signupEmployee`, data, {observe: 'response'});
  }

}
