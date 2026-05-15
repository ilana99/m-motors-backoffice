import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Login } from './login';
import { AuthService } from '../../../../services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let loginSpy: any;
  let routerMock: any;

  beforeEach(async () => {
    loginSpy = vi.fn();
    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: AuthService,
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
        email: 'user@gmail.com',
        password: 'password123',
      });
    });

    it('should submit credentials and navigate to dashboard on status 200', () => {
      loginSpy.mockReturnValue(of({ status: 200 }));
      component.login();

      expect(loginSpy).toHaveBeenCalledWith({
        email: 'user@gmail.com',
        password: 'password123',
      });
      expect(component.loginResponse()).toBe('');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to dashboard on status 201', () => {
      loginSpy.mockReturnValue(of({ status: 201 }));
      component.login();

      expect(component.loginResponse()).toBe('');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set loginResponse to "error" on 401 failure', () => {
      loginSpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 }))
      );
      component.login();

      expect(component.loginResponse()).toBe('error');
    });

    it('should clear the error and navigate on a later successful attempt', () => {
      loginSpy
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })))
        .mockReturnValueOnce(of({ status: 200 }));

      component.login();
      expect(component.loginResponse()).toBe('error');

      component.login();
      expect(component.loginResponse()).toBe('');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should move from success to error on a later failed attempt', () => {
      loginSpy
        .mockReturnValueOnce(of({ status: 201 }))
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));

      component.login();
      expect(component.loginResponse()).toBe('');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);

      component.login();
      expect(component.loginResponse()).toBe('error');
    });
  });
});
