import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Auth } from './pages/auth/auth';
import { Cars } from './pages/cars/cars';
import { Profile } from './pages/profile/profile';
import { Clientfiles } from './pages/clientfiles/clientfiles';
import { ClientfileDetailed } from './pages/clientfile-detailed/clientfile-detailed';
import { Dashboard } from './pages/dashboard/dashboard';
import { CarDetailed } from './pages/car-detailed/car-detailed';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
    },
    {
        path: 'login',
        component: Auth,
        canActivate: [authGuard],
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
    },
    {
        path: 'profil',
        component: Profile,
        canActivate: [authGuard],
    },
    {
        path: 'dossiers',
        component: Clientfiles,
        canActivate: [authGuard],
    },
    {
        path: 'dossiers/:id',
        component: ClientfileDetailed,
        canActivate: [authGuard],
    },
    {
        path: 'stock',
        component: Cars,
        canActivate: [authGuard],
    },
    {
        path: 'stock/:id',
        component: CarDetailed,
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
