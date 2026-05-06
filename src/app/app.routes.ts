import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Auth } from './pages/auth/auth';
import { Cars } from './pages/cars/cars';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cars',
    },
    {
        path: 'login',
        component: Auth,
        canActivate: [authGuard],
    },
    {
        path: 'profil',
        component: Profile,
        canActivate: [authGuard],
    },
    {
        path: 'cars',
        component: Cars,
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'cars',
    },
];
