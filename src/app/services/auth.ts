import { computed, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, Subscription, switchMap, tap, throwError } from 'rxjs';
import { Api } from './api';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly userState = signal<any | null>(null);
    private sessionCheck?: Subscription;

    readonly user = this.userState.asReadonly();
    readonly loggedIn = computed(() => this.userState() !== null);

    constructor(private api: Api) { }

    checkSession(): void {
        this.sessionCheck?.unsubscribe();
        this.sessionCheck = this.loadCurrentUser(true).subscribe();
    }

    login(data: any) {
        this.sessionCheck?.unsubscribe();

        return this.api.login(data).pipe(
            switchMap((response) =>
                this.loadCurrentUser(false).pipe(
                    map(() => response),
                ),
            ),
        );
    }

    logout() {
        this.sessionCheck?.unsubscribe();

        return this.api.logout().pipe(
            tap(() => {
                this.userState.set(null);
            }),
        );
    }

    private loadCurrentUser(suppressError: boolean): Observable<any | null> {
        return this.api.me().pipe(
            map((response) => {
                const user = response.body ?? null;

                if (user?.role !== 'employee') {
                    throw new Error('Unauthorized role');
                }

                return user;
            }),
            tap((user) => {
                this.userState.set(user);
            }),
            catchError((error) => {
                this.userState.set(null);

                if (suppressError) {
                    return of(null);
                }

                return throwError(() => error);
            }),
        );
    }

}
