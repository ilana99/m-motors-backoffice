import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Login } from './login';
import { Api } from '../../services/api';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let loginSpy: any;

  beforeEach(async () => {
    loginSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: Api,
          useValue: {
            login: loginSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'user@test.com',
        password: 'password123',
      });
    });

    it('should set loginResponse to "connected" on status 200', () => {
      loginSpy.mockReturnValue(of({ status: 200 }));
      component.login();

      expect(loginSpy).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
      });
      expect(component.loginResponse()).toBe('connected');
    });

    it('should set loginResponse to "connected" on status 201', () => {
      loginSpy.mockReturnValue(of({ status: 201 }));
      component.login();

      expect(component.loginResponse()).toBe('connected');
    });

    it('should set loginResponse to "error" on 401 failure', () => {
      loginSpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 }))
      );
      component.login();

      expect(component.loginResponse()).toBe('error');
    });

    it('should move from error to connected on a later successful attempt', () => {
      loginSpy
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })))
        .mockReturnValueOnce(of({ status: 200 }));

      component.login();
      expect(component.loginResponse()).toBe('error');

      component.login();
      expect(component.loginResponse()).toBe('connected');
    });

    it('should move from connected to error on a later failed attempt', () => {
      loginSpy
        .mockReturnValueOnce(of({ status: 201 }))
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));

      component.login();
      expect(component.loginResponse()).toBe('connected');

      component.login();
      expect(component.loginResponse()).toBe('error');
    });
  });
});
