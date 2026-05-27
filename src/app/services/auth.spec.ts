import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth';
import { Api } from './api';

describe('AuthService', () => {
    let service: AuthService;
    let apiMock: any;

    const user = {
        id: '1',
        surname: 'Marie',
        name: 'Maria',
        email: 'user@gmail.com',
        role: 'employee',
    };

    beforeEach(() => {
        apiMock = {
            signup: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            me: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                {
                    provide: Api,
                    useValue: apiMock,
                },
            ],
        });

        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check the current session', () => {
        apiMock.me.mockReturnValue(of({ body: user }));

        service.checkSession();

        expect(apiMock.me).toHaveBeenCalled();
        expect(service.user()).toEqual(user);
        expect(service.loggedIn()).toBe(true);
    });

    it('should clear the user when checking the session fails', () => {
        apiMock.me.mockReturnValue(throwError(() => new Error('')));

        service.checkSession();

        expect(service.user()).toBeNull();
        expect(service.loggedIn()).toBe(false);
    });

    it('should login and load the current user', () => {
        const credentials = {
            email: 'user@gmail.com',
            password: 'password123',
        };
        const response = { status: 201 };
        apiMock.login.mockReturnValue(of(response));
        apiMock.me.mockReturnValue(of({ body: user }));

        service.login(credentials).subscribe((result) => {
            expect(result).toEqual(response);
        });

        expect(apiMock.login).toHaveBeenCalledWith(credentials);
        expect(apiMock.me).toHaveBeenCalled();
        expect(service.user()).toEqual(user);
        expect(service.loggedIn()).toBe(true);
    });

    it('should clear the user when login cannot load the current user', () => {
        const error = new Error('');
        apiMock.login.mockReturnValue(of({ status: 201 }));
        apiMock.me.mockReturnValue(throwError(() => error));

        service.login({
            email: 'user@gmail.com',
            password: 'password123',
        }).subscribe({
            error: (response) => {
                expect(response).toBe(error);
            },
        });

        expect(service.user()).toBeNull();
        expect(service.loggedIn()).toBe(false);
    });

    it('should logout and clear the user', () => {
        apiMock.me.mockReturnValue(of({ body: user }));
        apiMock.logout.mockReturnValue(of({ status: 201 }));
        service.checkSession();

        service.logout().subscribe();

        expect(apiMock.logout).toHaveBeenCalled();
        expect(service.user()).toBeNull();
        expect(service.loggedIn()).toBe(false);
    });

    it('should reject a non admin role', () => {
        apiMock.login.mockReturnValue(of({ status: 201 }));
        apiMock.me.mockReturnValue(of({
            body: {
                ...user,
                role: 'user',
            },
        }));

        service.login({
            email: 'user@gmail.com',
            password: 'password123',
        }).subscribe({
            error: (error) => {
                expect(error.message).toBe('Unauthorized role');
            },
        });

        expect(service.user()).toBeNull();
        expect(service.loggedIn()).toBe(false);
    });
});
