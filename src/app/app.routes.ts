import { Routes } from '@angular/router';
import { requireAuthGuard } from './guards/auth.guard';
import { Auth } from './pages/auth/auth';
import { Cars } from './pages/cars/cars';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cars',
    },
    {
        path: 'login',
        component: Auth,
    },
    {
        path: 'cars',
        component: Cars,
        canActivate: [requireAuthGuard],
    },
    {
        path: '**',
        redirectTo: 'cars',
    },
];
